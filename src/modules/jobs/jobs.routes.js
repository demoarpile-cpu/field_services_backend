const express = require('express');
const router = express.Router();
const jobsController = require('./jobs.controller');
const { authenticate } = require('../../middlewares/auth');

router.get('/', authenticate, jobsController.getAll);
router.get('/:id', authenticate, jobsController.getById);
router.post('/', authenticate, jobsController.create);
router.put('/:id', authenticate, jobsController.update);
router.put('/:id/status', authenticate, jobsController.updateStatus);
router.patch('/:id/status', authenticate, jobsController.updateStatus);
router.put('/:id/assign', authenticate, jobsController.assignTechnician);
router.post('/:id/notes', authenticate, jobsController.addNote);
router.post('/:id/photos', authenticate, jobsController.addPhoto);
router.delete('/:id/photos', authenticate, jobsController.removePhoto);
router.post('/:id/files', authenticate, jobsController.addFile);
router.delete('/:id', authenticate, jobsController.remove);

router.post('/:id/location', authenticate, jobsController.updateLocation);
router.get('/:id/location', authenticate, jobsController.getLocation);
router.get('/:id/location-history', authenticate, jobsController.getLocationHistory);

router.get('/:id/tracking-status', authenticate, jobsController.getTrackingStatus);
router.patch('/:id/start-tracking', authenticate, jobsController.startTracking);
router.patch('/:id/stop-tracking', authenticate, jobsController.stopTracking);
router.post('/:id/start-signature', authenticate, jobsController.addStartSignature);
router.post('/:id/end-signature', authenticate, jobsController.addEndSignature);

module.exports = router;
