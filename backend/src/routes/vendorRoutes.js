const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

// CRUD operations
router.get('/', vendorController.getAllVendors);
router.post('/', vendorController.createVendor);
router.get('/:id', vendorController.getVendorById);
router.put('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

// RFP-related operations
router.get('/rfp/:rfpId', vendorController.getVendorsForRFP);
router.post('/rfp/:rfpId/assign', vendorController.assignVendorsToRFP);

module.exports = router;
