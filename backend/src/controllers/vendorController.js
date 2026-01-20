const vendorService = require('../services/vendorService');

/**
 * Vendor Controller - Handles HTTP requests for vendor operations
 */

/**
 * Create new vendor
 * POST /api/vendors
 */
async function createVendor(req, res) {
    try {
        const vendorData = req.body;

        if (!vendorData.name || !vendorData.email) {
            return res.status(400).json({
                error: 'Name and email are required'
            });
        }

        const vendor = await vendorService.createVendor(vendorData);
        console.log(`✅ Vendor created: ${vendor.name}`);

        res.status(201).json(vendor);
    } catch (error) {
        console.error('Error in createVendor:', error);

        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'Vendor with this email already exists' });
        } else {
            res.status(500).json({
                error: 'Failed to create vendor',
                message: error.message
            });
        }
    }
}

/**
 * Get all vendors
 * GET /api/vendors
 */
async function getAllVendors(req, res) {
    try {
        const vendors = await vendorService.getAllVendors();
        res.json(vendors);
    } catch (error) {
        console.error('Error in getAllVendors:', error);
        res.status(500).json({
            error: 'Failed to get vendors',
            message: error.message
        });
    }
}

/**
 * Get vendor by ID
 * GET /api/vendors/:id
 */
async function getVendorById(req, res) {
    try {
        const { id } = req.params;
        const vendor = await vendorService.getVendorById(id);
        res.json(vendor);
    } catch (error) {
        console.error('Error in getVendorById:', error);
        if (error.message === 'Vendor not found') {
            res.status(404).json({ error: 'Vendor not found' });
        } else {
            res.status(500).json({
                error: 'Failed to get vendor',
                message: error.message
            });
        }
    }
}

/**
 * Update vendor
 * PUT /api/vendors/:id
 */
async function updateVendor(req, res) {
    try {
        const { id } = req.params;
        const vendorData = req.body;

        const vendor = await vendorService.updateVendor(id, vendorData);
        console.log(`✅ Vendor updated: ${vendor.name}`);

        res.json(vendor);
    } catch (error) {
        console.error('Error in updateVendor:', error);
        if (error.message === 'Vendor not found') {
            res.status(404).json({ error: 'Vendor not found' });
        } else {
            res.status(500).json({
                error: 'Failed to update vendor',
                message: error.message
            });
        }
    }
}

/**
 * Delete vendor
 * DELETE /api/vendors/:id
 */
async function deleteVendor(req, res) {
    try {
        const { id } = req.params;
        await vendorService.deleteVendor(id);
        console.log(`✅ Vendor deleted: ID ${id}`);

        res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        console.error('Error in deleteVendor:', error);
        res.status(500).json({
            error: 'Failed to delete vendor',
            message: error.message
        });
    }
}

/**
 * Get vendors for RFP
 * GET /api/vendors/rfp/:rfpId
 */
async function getVendorsForRFP(req, res) {
    try {
        const { rfpId } = req.params;
        const vendors = await vendorService.getVendorsForRFP(rfpId);
        res.json(vendors);
    } catch (error) {
        console.error('Error in getVendorsForRFP:', error);
        res.status(500).json({
            error: 'Failed to get vendors for RFP',
            message: error.message
        });
    }
}

/**
 * Assign vendors to RFP
 * POST /api/vendors/rfp/:rfpId/assign
 */
async function assignVendorsToRFP(req, res) {
    try {
        const { rfpId } = req.params;
        const { vendorIds } = req.body;

        if (!vendorIds || !Array.isArray(vendorIds)) {
            return res.status(400).json({ error: 'vendorIds array is required' });
        }

        await vendorService.assignVendorsToRFP(rfpId, vendorIds);
        console.log(`✅ Vendors assigned to RFP ${rfpId}: ${vendorIds.join(', ')}`);

        res.json({ message: 'Vendors assigned successfully' });
    } catch (error) {
        console.error('Error in assignVendorsToRFP:', error);
        res.status(500).json({
            error: 'Failed to assign vendors to RFP',
            message: error.message
        });
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
