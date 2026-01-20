const proposalService = require('../services/proposalService');
const aiService = require('../services/aiService');
const rfpService = require('../services/rfpService');

/**
 * Proposal Controller - Handles HTTP requests for proposal operations
 */

/**
 * Get all proposals for an RFP
 * GET /api/rfps/:id/proposals
 */
async function getProposalsForRFP(req, res) {
    try {
        const { id } = req.params;
        const proposals = await proposalService.getProposalsForRFP(id);
        res.json(proposals);
    } catch (error) {
        console.error('Error in getProposalsForRFP:', error);
        res.status(500).json({
            error: 'Failed to get proposals',
            message: error.message,
        });
    }
}

/**
 * Get proposal by ID
 * GET /api/proposals/:id
 */
async function getProposalById(req, res) {
    try {
        const { id } = req.params;
        const proposal = await proposalService.getProposalById(id);
        res.json(proposal);
    } catch (error) {
        console.error('Error in getProposalById:', error);
        if (error.message === 'Proposal not found') {
            res.status(404).json({ error: 'Proposal not found' });
        } else {
            res.status(500).json({
                error: 'Failed to get proposal',
                message: error.message,
            });
        }
    }
}

/**
 * Get AI comparison for RFP proposals
 * GET /api/rfps/:id/comparison
 */
async function getAIComparison(req, res) {
    try {
        const { id } = req.params;

        // Get RFP details
        const rfp = await rfpService.getRFPById(id);

        // Get all proposals
        const proposals = await proposalService.getProposalsForRFP(id);

        if (proposals.length === 0) {
            return res.status(400).json({
                error: 'No proposals to compare',
                message: 'Wait for vendors to respond',
            });
        }

        // Generate AI comparison
        console.log(`🤖 Generating AI comparison for RFP ${id}...`);
        const comparison = await aiService.generateProposalComparison(rfp, proposals);

        res.json({
            rfp_id: id,
            proposal_count: proposals.length,
            comparison,
        });
    } catch (error) {
        console.error('Error in getAIComparison:', error);
        res.status(500).json({
            error: 'Failed to generate comparison',
            message: error.message,
        });
    }
}

/**
 * Get proposal statistics for an RFP
 * GET /api/rfps/:id/proposals/stats
 */
async function getProposalStats(req, res) {
    try {
        const { id } = req.params;
        const stats = await proposalService.getProposalStats(id);
        res.json(stats);
    } catch (error) {
        console.error('Error in getProposalStats:', error);
        res.status(500).json({
            error: 'Failed to get proposal stats',
            message: error.message,
        });
    }
}

module.exports = {
    getProposalsForRFP,
    getProposalById,
    getAIComparison,
    getProposalStats,
};

