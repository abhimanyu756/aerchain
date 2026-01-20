const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');

// Get proposal by ID
router.get('/:id', proposalController.getProposalById);

module.exports = router;

