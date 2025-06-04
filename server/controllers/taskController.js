const service = require('../services/taskService');

// Used only when task object is returned
const formatTask = (task) => ({
  id: task.scanId,
  name: task.name,
  status: task.status,
  targetId: task.targetId,
  scheduleId: task.scheduleId || null,
  engagementId: task.engagementId,
  createdAt: task.createdAt,
  finishedAt: task.finishedAt || null,
});

exports.create = async (req, res) => {
  try {
    const result = await service.createTask(req.body); 
    res.json(result); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (_req, res) => {
  try {
    const tasks = await service.getTasks();
    res.json(tasks.map(formatTask));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const task = await service.getTask(req.params.id);
    res.json(formatTask(task));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    await service.updateTask(req.params.id, req.body);
    res.json({ message: 'Task updated successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.remove = async (req, res) => {
  try {
    await service.deleteTask(req.params.id);
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.start = async (req, res) => {
  try {
    await service.startTask(req.params.id); // Assuming this still uses API-only logic
    res.json({ message: 'Task started successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};