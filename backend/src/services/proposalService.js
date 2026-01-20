const db = require('../config/database');

/**
 * Proposal Service - Business logic for proposal operations
 */

/**
 * Get all proposals for an RFP
 * @param {number} rfpId - RFP ID
 * @returns {Promise<array>} - Array of proposals with vendor info
 */
async function getProposalsForRFP(rfpId) {
    const query = `
        SELECT p.*, v.name as vendor_name, v.email as vendor_email, v.company_name
        FROM proposals p
        JOIN vendors v ON p.vendor_id = v.id
        WHERE p.rfp_id = $1
        ORDER BY p.completeness_score DESC
    `;

    try {
        const result = await db.query(query, [rfpId]);
        return result.rows;
    } catch (error) {
        console.error('Error getting proposals:', error);
        throw error;
    }
}

/**
 * Get proposal by ID
 * @param {number} id - Proposal ID
 * @returns {Promise<object>} - Proposal object
 */
async function getProposalById(id) {
    const query = `
        SELECT p.*, v.name as vendor_name, v.email as vendor_email, v.company_name
        FROM proposals p
        JOIN vendors v ON p.vendor_id = v.id
        WHERE p.id = $1
    `;

    try {
        const result = await db.query(query, [id]);
        if (result.rows.length === 0) {
            throw new Error('Proposal not found');
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error getting proposal:', error);
        throw error;
    }
}

/**
 * Update proposal - mark as reviewed with AI score
 * @param {number} id - Proposal ID
 * @param {object} data - Update data
 * @returns {Promise<object>} - Updated proposal
 */
async function updateProposal(id, data) {
    const query = `
        UPDATE proposals 
        SET ai_score = $1, ai_summary = $2, updated_at = NOW() 
        WHERE id = $3 RETURNING *
    `;

    try {
        const result = await db.query(query, [data.ai_score, data.ai_summary, id]);
        if (result.rows.length === 0) {
            throw new Error('Proposal not found');
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error updating proposal:', error);
        throw error;
    }
}

/**
 * Get proposal count for an RFP
 * @param {number} rfpId - RFP ID
 * @returns {Promise<object>} - Stats
 */
async function getProposalStats(rfpId) {
    const query = `
        SELECT 
            COUNT(*) as total,
            AVG(completeness_score) as avg_completeness,
            AVG(ai_score) as avg_ai_score
        FROM proposals
        WHERE rfp_id = $1
    `;

    try {
        const result = await db.query(query, [rfpId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error getting proposal stats:', error);
        throw error;
    }
}

module.exports = {
    getProposalsForRFP,
    getProposalById,
    updateProposal,
    getProposalStats,
};
