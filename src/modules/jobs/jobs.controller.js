const jobsService = require('./jobs.service');
const { getIO } = require('../../socket');

const withScheduledDate = (job) => {
  if (!job) return job;
  return {
    ...job,
    scheduledDate: job.scheduledAt ? new Date(job.scheduledAt).toISOString() : null
  };
};

const getAll = async (req, res, next) => {
  try {
    const jobs = await jobsService.getAll(req.user, req.query);
    res.json(jobs.map(withScheduledDate));
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const job = await jobsService.getById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(withScheduledDate(job));
  } catch (error) {
    next(error);
  }
};

const assignTechnician = async (req, res, next) => {
  try {
    const job = await jobsService.assignTechnician(req.params.id, req.body.employeeId);
    res.json(job);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const job = await jobsService.create(req.body);
    res.status(201).json(withScheduledDate(job));
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const job = await jobsService.update(req.params.id, req.body);
    res.json(withScheduledDate(job));
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const job = await jobsService.updateStatus(req.params.id, req.body.status);
    res.json(withScheduledDate(job));
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await jobsService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const addNote = async (req, res, next) => {
  try {
    const note = await jobsService.addNote(req.params.id, req.body.content);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

const addPhoto = async (req, res, next) => {
  try {
    const photo = await jobsService.addPhoto(req.params.id, req.body.url);
    res.status(201).json(photo);
  } catch (error) {
    next(error);
  }
};

const removePhoto = async (req, res, next) => {
  try {
    const url = req.body?.url;
    if (!url) return res.status(400).json({ message: 'Photo url is required' });
    await jobsService.removePhoto(req.params.id, url);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const addFile = async (req, res, next) => {
  try {
    const file = await jobsService.addFile(req.params.id, req.body);
    res.status(201).json(file);
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const employeeId = req.user.employee?.id;
    if (!employeeId) return res.status(403).json({ message: 'Only technicians can update job location' });
    
    await jobsService.updateLocation(req.params.id, employeeId, req.body);
    
    // Phase 5: Emit live update over socket
    const io = getIO();
    if (io) {
      io.emit('job:locationUpdated', {
        jobId: req.params.id,
        technicianId: employeeId,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        lastLocationUpdate: new Date().toISOString()
      });
    }

    res.status(200).json({ success: true, message: 'Location updated accurately' });
  } catch (error) {
    next(error);
  }
};

const getLocation = async (req, res, next) => {
  try {
    const location = await jobsService.getLocation(req.params.id);
    if (!location || !location.latitude) {
      return res.status(404).json({ message: 'No location available for this job yet' });
    }
    res.json(location);
  } catch (error) {
    next(error);
  }
};

const getLocationHistory = async (req, res, next) => {
  try {
    const history = await jobsService.getLocationHistory(req.params.id);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

const getTrackingStatus = async (req, res, next) => {
  try {
    const status = await jobsService.getTrackingStatus(req.params.id);
    res.json({ success: true, ...status });
  } catch (error) {
    next(error);
  }
};

const startTracking = async (req, res, next) => {
  try {
    await jobsService.startTracking(req.params.id);
    
    // Phase 5: Emit status change over socket
    const io = getIO();
    if (io) {
      io.emit('job:trackingStatusChanged', {
        jobId: req.params.id,
        trackingActive: true,
        trackingStartedAt: new Date().toISOString()
      });
    }

    res.json({ success: true, message: 'Tracking started' });
  } catch (error) {
    next(error);
  }
};

const stopTracking = async (req, res, next) => {
  try {
    await jobsService.stopTracking(req.params.id);
    
    // Phase 5: Emit status change over socket
    const io = getIO();
    if (io) {
      io.emit('job:trackingStatusChanged', {
        jobId: req.params.id,
        trackingActive: false,
        trackingStoppedAt: new Date().toISOString()
      });
    }

    res.json({ success: true, message: 'Tracking stopped' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getAll, 
  getById, 
  create, 
  update, 
  updateStatus, 
  addNote, 
  addPhoto, 
  removePhoto,
  addFile, 
  assignTechnician, 
  remove, 
  updateLocation, 
  getLocation,
  getLocationHistory,
  getTrackingStatus,
  startTracking,
  stopTracking
};
