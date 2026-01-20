const db = require('../config/database');

/**
 * RFP Service - Business logic for RFP operations
 */

/**
 * Helper function to sanitize empty strings to null for database
 */
function sanitizeForDB(value) {
    if (value === '' || value === undefined) return null;
    return value;
}

/**
 * Create a new RFP
 * @param {object} rfpData - RFP data object
 * @returns {Promise<object>} - Created RFP
 */
async function createRFP(rfpData) {
    const {
        title,
        description,
        budget,
        currency = 'USD',
        delivery_deadline,
        payment_terms,
        warranty_requirements,
        items,
        additional_requirements,
    } = rfpData;

    const query = `
    INSERT INTO rfps (
      title, description, budget, currency, delivery_deadline,
      payment_terms, warranty_requirements, items, additional_requirements, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

    const values = [
        title,
        description,
        sanitizeForDB(budget),
        currency,
        sanitizeForDB(delivery_deadline),  // Convert empty string to null
        sanitizeForDB(payment_terms),
        sanitizeForDB(warranty_requirements),
        JSON.stringify(items || []),
        sanitizeForDB(additional_requirements),
        'draft',
    ];

    try {
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating RFP:', error);
        throw error;
    }
}

/**
 * Get all RFPs
 * @returns {Promise<array>} - Array of RFPs
 */
async function getAllRFPs() {
    const query = `
    SELECT * FROM rfps
    ORDER BY created_at DESC
  `;

    try {
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error getting all RFPs:', error);
        throw error;
    }
}

/**
 * Get RFP by ID
 * @param {number} id - RFP ID
 * @returns {Promise<object>} - RFP object
 */
async function getRFPById(id) {
    const query = `
    SELECT * FROM rfps WHERE id = $1
  `;

    try {
        const result = await db.query(query, [id]);
        if (result.rows.length === 0) {
            throw new Error('RFP not found');
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error getting RFP by ID:', error);
        throw error;
    }
}

/**
 * Update RFP
 * @param {number} id - RFP ID
 * @param {object} rfpData - Updated RFP data
 * @returns {Promise<object>} - Updated RFP
 */
async function updateRFP(id, rfpData) {
    const {
        title,
        description,
        budget,
        currency,
        delivery_deadline,
        payment_terms,
        warranty_requirements,
        items,
        additional_requirements,
        status,
    } = rfpData;

    const query = `
    UPDATE rfps
    SET title = $1, description = $2, budget = $3, currency = $4,
        delivery_deadline = $5, payment_terms = $6, warranty_requirements = $7,
        items = $8, additional_requirements = $9, status = $10
    WHERE id = $11
    RETURNING *
  `;

    const values = [
        title,
        description,
        budget,
        currency,
        delivery_deadline,
        payment_terms,
        warranty_requirements,
        JSON.stringify(items),
        additional_requirements,
        status,
        id,
    ];

    try {
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('RFP not found');
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error updating RFP:', error);
        throw error;
    }
}

/**
 * Delete RFP
 * @param {number} id - RFP ID
 * @returns {Promise<void>}
 */
async function deleteRFP(id) {
    const query = `DELETE FROM rfps WHERE id = $1`;

    try {
        await db.query(query, [id]);
    } catch (error) {
        console.error('Error deleting RFP:', error);
        throw error;
    }
}

/**
 * Get RFP with vendors
 * @param {number} rfpId - RFP ID
 * @returns {Promise<object>} - RFP with vendors
 */
async function getRFPWithVendors(rfpId) {
    const rfpQuery = `SELECT * FROM rfps WHERE id = $1`;
    const vendorsQuery = `
    SELECT v.*, rv.status as rfp_status, rv.sent_at
    FROM vendors v
    JOIN rfp_vendors rv ON v.id = rv.vendor_id
    WHERE rv.rfp_id = $1
  `;

    try {
        const rfpResult = await db.query(rfpQuery, [rfpId]);
        if (rfpResult.rows.length === 0) {
            throw new Error('RFP not found');
        }

        const vendorsResult = await db.query(vendorsQuery, [rfpId]);

        return {
            ...rfpResult.rows[0],
            vendors: vendorsResult.rows,
        };
    } catch (error) {
        console.error('Error getting RFP with vendors:', error);
        throw error;
    }
}

module.exports = {
    createRFP,
    getAllRFPs,
    getRFPById,
    updateRFP,
    deleteRFP,
    getRFPWithVendors,
};
