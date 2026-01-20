const rfpService = require('../services/rfpService');
const vendorService = require('../services/vendorService');
const emailService = require('../services/emailService');

/**
 * Email Controller - Handles HTTP requests for email operations
 */

/**
 * Send RFP to selected vendors
 * POST /api/rfps/:id/send
 */
async function sendRFPToVendors(req, res) {
    try {
        const { id } = req.params;
        const { vendorIds } = req.body;

        if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
            return res.status(400).json({ error: 'vendorIds array is required' });
        }

        console.log(`📧 Sending RFP ${id} to ${vendorIds.length} vendors...`);

        // Get RFP details
        const rfp = await rfpService.getRFPById(id);

        // Assign vendors to RFP if not already assigned
        await vendorService.assignVendorsToRFP(id, vendorIds);

        // Get vendor details
        const vendors = [];
        for (const vendorId of vendorIds) {
            const vendor = await vendorService.getVendorById(vendorId);
            vendors.push(vendor);
        }

        // Send emails
        const results = await emailService.sendRFPToVendors(rfp, vendors);

        console.log(`✅ RFP sent: ${results.success.length} success, ${results.failed.length} failed`);

        res.json({
            message: 'RFP sent to vendors',
            results,
        });
    } catch (error) {
        console.error('Error in sendRFPToVendors:', error);
        res.status(500).json({
            error: 'Failed to send RFP to vendors',
            message: error.message,
        });
    }
}

/**
 * Get email logs for an RFP
 * GET /api/rfps/:id/emails
 */
async function getEmailsForRFP(req, res) {
    try {
        const { id } = req.params;

        const query = `
            SELECT el.*, v.name as vendor_name, v.email as vendor_email
            FROM email_logs el
            JOIN vendors v ON el.vendor_id = v.id
            WHERE el.rfp_id = $1
            ORDER BY el.created_at DESC
        `;

        const db = require('../config/database');
        const result = await db.query(query, [id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error in getEmailsForRFP:', error);
        res.status(500).json({
            error: 'Failed to get emails',
            message: error.message,
        });
    }
}

module.exports = {
    sendRFPToVendors,
    getEmailsForRFP,
};
