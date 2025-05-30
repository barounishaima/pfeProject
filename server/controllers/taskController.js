import service from '../services/taskService';

// Used only when task object is returned
const formatTask = (task) => ({
  id: task["@id"],
  name: task["@name"],
  status: task["@status"],
  progress: task["@progress"],
  targetId: task["target"]?.["@id"],
  targetName: task["target"]?.["@name"],
  configId: task["config"]?.["@id"],
  configName: task["config"]?.["@name"],
  scheduleId: task["schedule"]?.["@id"],
  scheduleName: task["schedule"]?.["@name"],
  scannerId: task["scanner"]?.["@id"],
  scannerName: task["scanner"]?.["@name"],
});

exports.create = async (req, res) => {
  try {
    const result = await service.createTask(req.body);
    res.json(formatTask(result.data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (_req, res) => {
  try {
    const result = await service.getTasks();
    const tasks = Array.isArray(result.data)
      ? result.data.map(formatTask)
      : result.data.task
        ? (Array.isArray(result.data.task) ? result.data.task.map(formatTask) : [formatTask(result.data.task)])
        : [];
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await service.getTask(req.params.id);
    res.json(formatTask(result.data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await service.updateTask(req.params.id, req.body);
    res.json({ message: result.message || 'Task updated successfully', id: req.params.id });
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
    await service.startTask(req.params.id);
    res.json({ message: 'Task started successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};