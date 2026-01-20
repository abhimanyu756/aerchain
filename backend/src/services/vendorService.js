const db = require('../config/database');

/**
 * Vendor Service - Business logic for vendor operations
 */

/**
 * Create a new vendor
 * @param {object} vendorData - Vendor data object
 * @returns {Promise<object>} - Created vendor
 */
async function createVendor(vendorData) {
    const {
        name,
        email,
        phone,
        company_name,
        address,
        specialization,
        notes,
    } = vendorData;

    const query = `
    INSERT INTO vendors (name, email, phone, company_name, address, specialization, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

    const values = [name, email, phone, company_name, address, specialization, notes];

    try {
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating vendor:', error);
        throw error;
    }
}

/**
 * Get all vendors
 * @returns {Promise<array>} - Array of vendors
 */
async function getAllVendors() {
    const query = `SELECT * FROM vendors ORDER BY created_at DESC`;

    try {
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error getting all vendors:', error);
        throw error;
    }
}

/**
 * Get vendor by ID
 * @param {number} id - Vendor ID
 * @returns {Promise<object>} - Vendor object
 */
async function getVendorById(id) {
    const query = `SELECT * FROM vendors WHERE id = $1`;

    try {
        const result = await db.query(query, [id]);
        if (result.rows.length === 0) {
            throw new Error('Vendor not found');
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error getting vendor by ID:', error);
        throw error;
    }
}

/**
 * Update vendor
 * @param {number} id - Vendor ID
 * @param {object} vendorData - Updated vendor data
 * @returns {Promise<object>} - Updated vendor
 */
async function updateVendor(id, vendorData) {
    const {
        name,
        email,
        phone,
        company_name,
        address,
        specialization,
        notes,
    } = vendorData;

    const query = `
    UPDATE vendors
    SET name = $1, email = $2, phone = $3, company_name = $4,
        address = $5, specialization = $6, notes = $7
    WHERE id = $8
    RETURNING *
  `;

    const values = [name, email, phone, company_name, address, specialization, notes, id];

    try {
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Vendor not found');
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error updating vendor:', error);
        throw error;
    }
}

/**
 * Delete vendor
 * @param {number} id - Vendor ID
 * @returns {Promise<void>}
 */
async function deleteVendor(id) {
    const query = `DELETE FROM vendors WHERE id = $1`;

    try {
        await db.query(query, [id]);
    } catch (error) {
        console.error('Error deleting vendor:', error);
        throw error;
    }
}

/**
 * Get vendors for an RFP
 * @param {number} rfpId - RFP ID
 * @returns {Promise<array>} - Array of vendors with RFP status
 */
async function getVendorsForRFP(rfpId) {
    const query = `
    SELECT v.*, 
           rv.status as rfp_status, 
           rv.sent_at,
           rv.email_message_id
    FROM vendors v
    LEFT JOIN rfp_vendors rv ON v.id = rv.vendor_id AND rv.rfp_id = $1
    ORDER BY v.name
  `;

    try {
        const result = await db.query(query, [rfpId]);
        return result.rows;
    } catch (error) {
        console.error('Error getting vendors for RFP:', error);
        throw error;
    }
}

/**
 * Assign vendors to RFP
 * @param {number} rfpId - RFP ID
 * @param {array} vendorIds - Array of vendor IDs
 * @returns {Promise<void>}
 */
async function assignVendorsToRFP(rfpId, vendorIds) {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Insert new vendor assignments
        for (const vendorId of vendorIds) {
            await client.query(
                `INSERT INTO rfp_vendors (rfp_id, vendor_id, status)
         VALUES ($1, $2, 'pending')
         ON CONFLICT (rfp_id, vendor_id) DO NOTHING`,
                [rfpId, vendorId]
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error assigning vendors to RFP:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    createVendor,
    getAllVendors,
    getVendorById,
    updateVendor,
    deleteVendor,
    getVendorsForRFP,
    assignVendorsToRFP,
};
