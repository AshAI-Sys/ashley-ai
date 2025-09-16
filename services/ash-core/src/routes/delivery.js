const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery-controller');
const { authenticateToken } = require('../middleware/auth');

// Get all deliveries for a workspace
router.get('/workspace/:workspaceId', authenticateToken, deliveryController.getDeliveries);

// Get delivery by ID
router.get('/:deliveryId', authenticateToken, deliveryController.getDeliveryById);

// Create new delivery
router.post('/', authenticateToken, deliveryController.createDelivery);

// Update delivery status
router.patch('/:deliveryId/status', authenticateToken, deliveryController.updateDeliveryStatus);

// Add delivery tracking event
router.post('/:deliveryId/tracking', authenticateToken, deliveryController.addTrackingEvent);

// Get delivery tracking history
router.get('/:deliveryId/tracking', authenticateToken, deliveryController.getTrackingHistory);

// Update delivery location
router.patch('/:deliveryId/location', authenticateToken, deliveryController.updateLocation);

// Get deliveries by status
router.get('/workspace/:workspaceId/status/:status', authenticateToken, deliveryController.getDeliveriesByStatus);

// Get delivery performance metrics
router.get('/workspace/:workspaceId/metrics', authenticateToken, deliveryController.getDeliveryMetrics);

module.exports = router;
module.exports.deliveryRouter = router;