const aiService = require('../services/aiService');
const rfpService = require('../services/rfpService');

/**
 * RFP Controller - Handles HTTP requests for RFP operations
 */

/**
 * Parse RFP from natural language input (returns parsed data, does NOT save)
 * POST /api/rfps/create-from-text
 */
async function createRFPFromText(req, res) {
    try {
        const { naturalLanguageInput } = req.body;

        if (!naturalLanguageInput || naturalLanguageInput.trim() === '') {
            return res.status(400).json({
                error: 'Natural language input is required'
            });
        }

        console.log('📝 Parsing RFP from natural language...');

        // Use AI to parse the natural language input
        const parsedRFP = await aiService.parseRFPFromText(naturalLanguageInput);

        console.log('✅ RFP parsed successfully (not saved yet)');

        // Return the parsed data WITHOUT saving - user will review and then save
        res.status(200).json(parsedRFP);
    } catch (error) {
        console.error('Error in createRFPFromText:', error);
        res.status(500).json({
            error: 'Failed to create RFP from text',
            message: error.message
        });
    }
}

/**
 * Create or update RFP manually
 * POST /api/rfps
 */
async function createRFP(req, res) {
    try {
        const rfpData = req.body;

        // Validate required fields
        if (!rfpData.title || !rfpData.description || !rfpData.items) {
            return res.status(400).json({
                error: 'Title, description, and items are required'
            });
        }

        const createdRFP = await rfpService.createRFP(rfpData);

        console.log(`✅ RFP created: ID ${createdRFP.id}`);

        res.status(201).json(createdRFP);
    } catch (error) {
        console.error('Error in createRFP:', error);
        res.status(500).json({
            error: 'Failed to create RFP',
            message: error.message
        });
    }
}

/**
 * Get all RFPs
 * GET /api/rfps
 */
async function getAllRFPs(req, res) {
    try {
        const rfps = await rfpService.getAllRFPs();
        res.json(rfps);
    } catch (error) {
        console.error('Error in getAllRFPs:', error);
        res.status(500).json({
            error: 'Failed to get RFPs',
            message: error.message
        });
    }
}

/**
 * Get RFP by ID
 * GET /api/rfps/:id
 */
async function getRFPById(req, res) {
    try {
        const { id } = req.params;
        const rfp = await rfpService.getRFPById(id);
        res.json(rfp);
    } catch (error) {
        console.error('Error in getRFPById:', error);
        if (error.message === 'RFP not found') {
            res.status(404).json({ error: 'RFP not found' });
        } else {
            res.status(500).json({
                error: 'Failed to get RFP',
                message: error.message
            });
        }
    }
}

/**
 * Update RFP
 * PUT /api/rfps/:id
 */
async function updateRFP(req, res) {
    try {
        const { id } = req.params;
        const rfpData = req.body;

        const updatedRFP = await rfpService.updateRFP(id, rfpData);

        console.log(`✅ RFP updated: ID ${id}`);

        res.json(updatedRFP);
    } catch (error) {
        console.error('Error in updateRFP:', error);
        if (error.message === 'RFP not found') {
            res.status(404).json({ error: 'RFP not found' });
        } else {
            res.status(500).json({
                error: 'Failed to update RFP',
                message: error.message
            });
        }
    }
}

/**
 * Delete RFP
 * DELETE /api/rfps/:id
 */
async function deleteRFP(req, res) {
    try {
        const { id } = req.params;
        await rfpService.deleteRFP(id);

        console.log(`✅ RFP deleted: ID ${id}`);

        res.json({ message: 'RFP deleted successfully' });
    } catch (error) {
        console.error('Error in deleteRFP:', error);
        res.status(500).json({
            error: 'Failed to delete RFP',
            message: error.message
        });
    }
}

/**
 * Get RFP with vendors
 * GET /api/rfps/:id/vendors
 */
async function getRFPWithVendors(req, res) {
    try {
        const { id } = req.params;
        const rfpWithVendors = await rfpService.getRFPWithVendors(id);
        res.json(rfpWithVendors);
    } catch (error) {
        console.error('Error in getRFPWithVendors:', error);
        if (error.message === 'RFP not found') {
            res.status(404).json({ error: 'RFP not found' });
        } else {
            res.status(500).json({
                error: 'Failed to get RFP with vendors',
                message: error.message
            });
        }
    }
}

module.exports = {
    createRFPFromText,
    createRFP,
    getAllRFPs,
    getRFPById,
    updateRFP,
    deleteRFP,
    getRFPWithVendors,
};
