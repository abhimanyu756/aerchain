const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const db = require('../config/database');
const aiService = require('./aiService');
const { imapConfig } = require('../config/email');

/**
 * Email Receiver Service - Handles incoming email monitoring via IMAP
 */

let isPolling = false;
let pollInterval = null;

/**
 * Connect to IMAP server
 * @returns {Promise<object>} - IMAP connection
 */
async function connectToIMAP() {
    try {
        const connection = await imaps.connect({ imap: imapConfig });
        console.log('✅ Connected to IMAP server');
        return connection;
    } catch (error) {
        console.error('❌ Failed to connect to IMAP:', error.message);
        throw error;
    }
}

/**
 * Extract RFP ID from email subject or headers
 * @param {object} email - Parsed email object
 * @returns {number|null} - RFP ID or null
 */
function extractRFPId(email) {
    // Try to extract from subject (format: "Re: ... (RFP-123)" or "RFP-123")
    const subjectMatch = email.subject?.match(/RFP-(\d+)/i);
    if (subjectMatch) {
        return parseInt(subjectMatch[1], 10);
    }

    // Try to extract from In-Reply-To or References headers
    const headers = email.headers || {};
    const references = headers['references'] || headers['in-reply-to'] || '';
    const headerMatch = references.match(/rfp-(\d+)/i);
    if (headerMatch) {
        return parseInt(headerMatch[1], 10);
    }

    return null;
}

/**
 * Find vendor by email address
 * @param {string} fromEmail - Sender email address
 * @returns {Promise<object|null>} - Vendor or null
 */
async function findVendorByEmail(fromEmail) {
    // Extract email from "Name <email@domain.com>" format
    const emailMatch = fromEmail.match(/<([^>]+)>/) || [null, fromEmail];
    const email = emailMatch[1]?.toLowerCase().trim();

    if (!email) return null;

    try {
        const result = await db.query(
            'SELECT * FROM vendors WHERE LOWER(email) = $1',
            [email]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding vendor:', error);
        return null;
    }
}

/**
 * Check if vendor is associated with RFP
 * @param {number} rfpId - RFP ID
 * @param {number} vendorId - Vendor ID
 * @returns {Promise<boolean>}
 */
async function isVendorAssociatedWithRFP(rfpId, vendorId) {
    try {
        const result = await db.query(
            'SELECT 1 FROM rfp_vendors WHERE rfp_id = $1 AND vendor_id = $2',
            [rfpId, vendorId]
        );
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking vendor-RFP association:', error);
        return false;
    }
}

/**
 * Check if proposal already exists for this RFP and vendor
 * @param {number} rfpId - RFP ID
 * @param {number} vendorId - Vendor ID
 * @returns {Promise<boolean>}
 */
async function proposalExists(rfpId, vendorId) {
    try {
        const result = await db.query(
            'SELECT 1 FROM proposals WHERE rfp_id = $1 AND vendor_id = $2',
            [rfpId, vendorId]
        );
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking proposal exists:', error);
        return false;
    }
}

/**
 * Save proposal to database
 * @param {object} proposalData - Proposal data
 * @returns {Promise<object>} - Created proposal
 */
async function saveProposal(proposalData) {
    // Check for duplicate
    const exists = await proposalExists(proposalData.rfp_id, proposalData.vendor_id);
    if (exists) {
        console.log(`   ⚠️ Proposal already exists for RFP ${proposalData.rfp_id} from vendor ${proposalData.vendor_id}, skipping`);
        return null;
    }

    const query = `
        INSERT INTO proposals (
            rfp_id, vendor_id, total_price, delivery_time_days,
            payment_terms, warranty_offered, additional_terms,
            completeness_score, raw_email_body, parsed_data
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
    `;

    const values = [
        proposalData.rfp_id,
        proposalData.vendor_id,
        proposalData.total_price,
        proposalData.delivery_time_days,
        proposalData.payment_terms,
        proposalData.warranty_offered,
        proposalData.additional_terms,
        proposalData.completeness_score,
        proposalData.raw_email,
        JSON.stringify(proposalData.items_quoted || []),
    ];

    const result = await db.query(query, values);
    return result.rows[0];
}

/**
 * Process a single email
 * @param {object} email - Parsed email object
 * @returns {Promise<object|null>} - Processing result
 */
async function processEmail(email) {
    console.log(`📧 Processing email: ${email.subject}`);

    // Extract RFP ID
    const rfpId = extractRFPId(email);
    if (!rfpId) {
        console.log('   ⚠️ No RFP ID found in email, skipping');
        return null;
    }

    // Find vendor
    const fromAddress = email.from?.text || email.from?.value?.[0]?.address;
    const vendor = await findVendorByEmail(fromAddress);
    if (!vendor) {
        console.log(`   ⚠️ Unknown vendor: ${fromAddress}, skipping`);
        return null;
    }

    // Verify vendor is associated with this RFP
    const isAssociated = await isVendorAssociatedWithRFP(rfpId, vendor.id);
    if (!isAssociated) {
        console.log(`   ⚠️ Vendor ${vendor.name} not associated with RFP ${rfpId}, skipping`);
        return null;
    }

    try {
        // Get RFP details for context
        const rfpResult = await db.query('SELECT * FROM rfps WHERE id = $1', [rfpId]);
        if (rfpResult.rows.length === 0) {
            console.log(`   ⚠️ RFP ${rfpId} not found, skipping`);
            return null;
        }
        const rfp = rfpResult.rows[0];

        // Extract email body (prefer plain text over HTML)
        const emailBody = email.text || email.html?.replace(/<[^>]*>/g, ' ') || '';

        // Use AI to parse the proposal
        console.log(`   🤖 Parsing proposal from ${vendor.name}...`);
        const parsedProposal = await aiService.parseProposalFromEmail(emailBody, rfp);

        // Save proposal to database
        const proposal = await saveProposal({
            rfp_id: rfpId,
            vendor_id: vendor.id,
            ...parsedProposal,
            raw_email: emailBody,
        });

        // Update rfp_vendors status
        await db.query(
            `UPDATE rfp_vendors SET status = 'responded' WHERE rfp_id = $1 AND vendor_id = $2`,
            [rfpId, vendor.id]
        );

        // Log the incoming email
        const emailService = require('./emailService');
        await emailService.logEmail({
            rfp_id: rfpId,
            vendor_id: vendor.id,
            direction: 'incoming',
            subject: email.subject,
            body: emailBody,
            message_id: email.messageId,
            status: 'processed',
        });

        console.log(`   ✅ Proposal saved: ID ${proposal.id} (Score: ${parsedProposal.completeness_score}%)`);

        return {
            proposal_id: proposal.id,
            rfp_id: rfpId,
            vendor_id: vendor.id,
            vendor_name: vendor.name,
            completeness_score: parsedProposal.completeness_score,
        };
    } catch (error) {
        console.error(`   ❌ Error processing email:`, error.message);

        // Log failed processing
        try {
            const emailService = require('./emailService');
            await emailService.logEmail({
                rfp_id: rfpId,
                vendor_id: vendor.id,
                direction: 'incoming',
                subject: email.subject,
                body: email.text || '',
                message_id: email.messageId,
                status: 'failed',
                error_message: error.message,
            });
        } catch (logError) {
            console.error('Failed to log email error:', logError);
        }

        return null;
    }
}

/**
 * Fetch and process new emails
 * @param {boolean} checkAll - If true, check all recent emails (not just unread)
 * @returns {Promise<array>} - Array of processing results
 */
async function checkForNewEmails(checkAll = false) {
    if (isPolling) {
        console.log('⏳ Already polling, skipping...');
        return [];
    }

    isPolling = true;
    const results = [];

    try {
        const connection = await connectToIMAP();
        await connection.openBox('INBOX');

        // Search criteria - check all emails from last 3 days if checkAll is true
        let searchCriteria;
        if (checkAll) {
            // Get emails from last 3 days
            const sinceDate = new Date();
            sinceDate.setDate(sinceDate.getDate() - 3);
            searchCriteria = [['SINCE', sinceDate]];
            console.log(`📧 Checking ALL emails since ${sinceDate.toDateString()}...`);
        } else {
            searchCriteria = ['UNSEEN'];
        }

        const fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: true, // Mark as seen to prevent reprocessing
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        console.log(`📬 Found ${messages.length} email(s) to check`);

        for (const message of messages) {
            try {
                // Get the full email
                const all = message.parts.find((part) => part.which === '');
                const parsed = await simpleParser(all.body);

                console.log(`\n📧 Email Details:`);
                console.log(`   Subject: ${parsed.subject}`);
                console.log(`   From: ${parsed.from?.text}`);
                console.log(`   Date: ${parsed.date}`);

                // Try to extract RFP ID
                const rfpId = extractRFPId(parsed);
                console.log(`   RFP ID found: ${rfpId || 'NONE'}`);

                if (rfpId) {
                    const result = await processEmail(parsed);
                    if (result) {
                        results.push(result);
                    }
                }
            } catch (error) {
                console.error('Error parsing email:', error.message);
            }
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Error checking emails:', error.message);
    } finally {
        isPolling = false;
    }

    return results;
}

/**
 * Start email polling worker
 * @param {number} intervalMs - Polling interval in milliseconds
 */
function startEmailPolling(intervalMs = 60000) {
    if (pollInterval) {
        console.log('Email polling already running');
        return;
    }

    console.log(`📧 Starting email polling (every ${intervalMs / 1000}s)...`);

    // Initial check
    checkForNewEmails().catch(console.error);

    // Set up interval
    pollInterval = setInterval(() => {
        checkForNewEmails().catch(console.error);
    }, intervalMs);
}

/**
 * Stop email polling worker
 */
function stopEmailPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
        console.log('📧 Email polling stopped');
    }
}

module.exports = {
    connectToIMAP,
    checkForNewEmails,
    processEmail,
    startEmailPolling,
    stopEmailPolling,
    extractRFPId,
    findVendorByEmail,
};
