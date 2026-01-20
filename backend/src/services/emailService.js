const { transporter } = require('../config/email');
const db = require('../config/database');

/**
 * Email Service - Handles email sending operations
 */

/**
 * Generate HTML email template for RFP
 * @param {object} rfp - RFP object
 * @param {object} vendor - Vendor object
 * @returns {string} - HTML email content
 */
function generateRFPEmailTemplate(rfp, vendor) {
    const items = typeof rfp.items === 'string' ? JSON.parse(rfp.items) : rfp.items;

    const itemsHTML = items.map((item, index) => `
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${index + 1}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.specifications || '-'}</td>
        </tr>
    `).join('');

    const deadlineText = rfp.delivery_deadline
        ? new Date(rfp.delivery_deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'To be discussed';

    const budgetText = rfp.budget
        ? `${rfp.currency || 'USD'} ${Number(rfp.budget).toLocaleString()}`
        : 'Open to proposals';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Request for Proposal - ${rfp.title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1976d2, #2196f3); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">Request for Proposal</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">RFP ID: ${rfp.id}</p>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none;">
        <p>Dear ${vendor.name},</p>
        
        <p>We are pleased to invite ${vendor.company_name || 'your company'} to submit a proposal for the following procurement request:</p>
        
        <h2 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">${rfp.title}</h2>
        
        <h3>Description</h3>
        <p>${rfp.description}</p>
        
        <h3>Items Required</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background: #1976d2; color: white;">
                    <th style="padding: 10px; text-align: left;">#</th>
                    <th style="padding: 10px; text-align: left;">Item</th>
                    <th style="padding: 10px; text-align: left;">Quantity</th>
                    <th style="padding: 10px; text-align: left;">Specifications</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
        </table>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Key Details</h3>
            <table style="width: 100%;">
                <tr>
                    <td style="padding: 8px 0;"><strong>Budget:</strong></td>
                    <td style="padding: 8px 0;">${budgetText}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;"><strong>Delivery Deadline:</strong></td>
                    <td style="padding: 8px 0;">${deadlineText}</td>
                </tr>
                ${rfp.payment_terms ? `
                <tr>
                    <td style="padding: 8px 0;"><strong>Payment Terms:</strong></td>
                    <td style="padding: 8px 0;">${rfp.payment_terms}</td>
                </tr>
                ` : ''}
                ${rfp.warranty_requirements ? `
                <tr>
                    <td style="padding: 8px 0;"><strong>Warranty Requirements:</strong></td>
                    <td style="padding: 8px 0;">${rfp.warranty_requirements}</td>
                </tr>
                ` : ''}
            </table>
        </div>
        
        ${rfp.additional_requirements ? `
        <h3>Additional Requirements</h3>
        <p>${rfp.additional_requirements}</p>
        ` : ''}
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1976d2;">How to Respond</h3>
            <p>Please reply to this email with your proposal including:</p>
            <ul>
                <li>Unit prices for each item</li>
                <li>Total cost</li>
                <li>Delivery timeline</li>
                <li>Payment terms you can offer</li>
                <li>Warranty terms</li>
                <li>Any terms and conditions</li>
            </ul>
        </div>
        
        <p>We look forward to receiving your proposal.</p>
        
        <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>Procurement Team</strong>
        </p>
    </div>
    
    <div style="background: #333; color: #999; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
        <p style="margin: 0;">This is an automated message from the RFP Management System</p>
        <p style="margin: 5px 0 0 0;">Reference: RFP-${rfp.id}</p>
    </div>
</body>
</html>
    `;
}

/**
 * Send RFP email to a vendor
 * @param {object} rfp - RFP object
 * @param {object} vendor - Vendor object
 * @returns {Promise<object>} - Send result
 */
async function sendRFPEmail(rfp, vendor) {
    const htmlContent = generateRFPEmailTemplate(rfp, vendor);

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: vendor.email,
        subject: `Request for Proposal: ${rfp.title} (RFP-${rfp.id})`,
        html: htmlContent,
        headers: {
            'X-RFP-ID': rfp.id.toString(),
            'X-Vendor-ID': vendor.id.toString(),
        },
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${vendor.email}: ${info.messageId}`);

        // Log email to database
        await logEmail({
            rfp_id: rfp.id,
            vendor_id: vendor.id,
            direction: 'outgoing',
            subject: mailOptions.subject,
            body: htmlContent,
            message_id: info.messageId,
            status: 'sent',
        });

        return {
            success: true,
            messageId: info.messageId,
            vendor: vendor.email,
        };
    } catch (error) {
        console.error(`❌ Error sending email to ${vendor.email}:`, error);

        // Log failed email
        await logEmail({
            rfp_id: rfp.id,
            vendor_id: vendor.id,
            direction: 'outgoing',
            subject: mailOptions.subject,
            body: htmlContent,
            status: 'failed',
            error_message: error.message,
        });

        throw error;
    }
}

/**
 * Send RFP to multiple vendors
 * @param {object} rfp - RFP object
 * @param {array} vendors - Array of vendor objects
 * @returns {Promise<object>} - Results for all vendors
 */
async function sendRFPToVendors(rfp, vendors) {
    const results = {
        success: [],
        failed: [],
    };

    for (const vendor of vendors) {
        try {
            const result = await sendRFPEmail(rfp, vendor);
            results.success.push(result);

            // Update rfp_vendors status
            await db.query(
                `UPDATE rfp_vendors SET status = 'sent', sent_at = NOW() 
                 WHERE rfp_id = $1 AND vendor_id = $2`,
                [rfp.id, vendor.id]
            );
        } catch (error) {
            results.failed.push({
                vendor: vendor.email,
                error: error.message,
            });
        }
    }

    // Update RFP status if all emails sent
    if (results.success.length > 0) {
        await db.query(
            `UPDATE rfps SET status = 'sent' WHERE id = $1`,
            [rfp.id]
        );
    }

    return results;
}

/**
 * Log email to database
 * @param {object} emailData - Email data
 */
async function logEmail(emailData) {
    const query = `
        INSERT INTO email_logs (rfp_id, vendor_id, direction, subject, body, message_id, status, error_message)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;

    const values = [
        emailData.rfp_id,
        emailData.vendor_id,
        emailData.direction,
        emailData.subject,
        emailData.body,
        emailData.message_id || null,
        emailData.status,
        emailData.error_message || null,
    ];

    try {
        await db.query(query, values);
    } catch (error) {
        console.error('Error logging email:', error);
    }
}

module.exports = {
    sendRFPEmail,
    sendRFPToVendors,
    generateRFPEmailTemplate,
    logEmail,
};
