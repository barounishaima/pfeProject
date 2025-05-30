const service = require('../services/scheduleService');

// Create Schedule
exports.create = async (req, res) => {
  try {
    const result = await service.createSchedule(req.body);
    res.json({
      success: result.data.status === '201',
      id: result.data.id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Schedules
exports.getAll = async (_req, res) => {
  try {
    const result = await service.getSchedules();
    const rawSchedules = result.data.schedule || [];

    const schedules = rawSchedules.map(s => ({
      id: s.id,
      name: s.name,
      owner: s.owner?.name || 'unknown',
      timezone: s.timezone,
      in_use: s.in_use === '1',
      creation_time: s.creation_time
    }));

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get One Schedule
exports.getOne = async (req, res) => {
  try {
    const result = await service.getSchedule(req.params.id);
    const s = result.data.schedule;

    const schedule = {
      id: s.id,
      name: s.name,
      owner: s.owner?.name || 'unknown',
      timezone: s.timezone,
      in_use: s.in_use === '1',
      creation_time: s.creation_time,
      icalendar: s.icalendar // optional for detailed frontend view
    };

    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Schedule
exports.update = async (req, res) => {
  try {
    const result = await service.updateSchedule(req.params.id, req.body);
    res.json({
      success: true,
      message: result.data.message
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Schedule
exports.remove = async (req, res) => {
  try {
    const result = await service.deleteSchedule(req.params.id);
    res.json({
      success: true,
      message: result.data.message
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};