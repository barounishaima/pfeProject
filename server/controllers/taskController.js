import * as service from '../services/taskService.js';

// Format task for consistent frontend shape
const formatTask = (task) => ({
  id: task.scanId,
  name: task.name,
  comment: task.comment,
  status: task.status,
  targetId: task.target_Id,
  scheduleId: task.schedule_Id || null,
  engagementId: task.engagementId,
  createdAt: task.createdAt,
  finishedAt: task.finishedAt || null,
});

export const create = async (req, res) => {
  try {
    const result = await service.createTask(req.body); 
    res.json(result); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAll = async (_req, res) => {
  try {
    const tasks = await service.getTasks();
    res.json(tasks.map(formatTask));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const task = await service.getTask(req.params.id);
    res.json(formatTask(task));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    await service.updateTask(req.params.id, req.body);
    res.json({ message: 'Task updated successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await service.deleteTask(req.params.id);
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const start = async (req, res) => {
  try {
    await service.startTask(req.params.id);
    res.json({ message: 'Task started successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
