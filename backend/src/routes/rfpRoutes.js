const express = require('express');
const router = express.Router();
const rfpController = require('../controllers/rfpController');
const emailController = require('../controllers/emailController');
const proposalController = require('../controllers/proposalController');

// Create RFP from natural language
router.post('/create-from-text', rfpController.createRFPFromText);

// CRUD operations
router.post('/', rfpController.createRFP);
router.get('/', rfpController.getAllRFPs);
router.get('/:id', rfpController.getRFPById);
router.put('/:id', rfpController.updateRFP);
router.delete('/:id', rfpController.deleteRFP);

// Get RFP with vendors
router.get('/:id/vendors', rfpController.getRFPWithVendors);

// Email operations
router.post('/:id/send', emailController.sendRFPToVendors);
router.get('/:id/emails', emailController.getEmailsForRFP);

// Proposal operations
router.get('/:id/proposals', proposalController.getProposalsForRFP);
router.get('/:id/proposals/stats', proposalController.getProposalStats);
router.get('/:id/comparison', proposalController.getAIComparison);

module.exports = router;

