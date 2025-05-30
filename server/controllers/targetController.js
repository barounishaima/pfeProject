import service from '../services/targetService';

// Create Target
exports.create = async (req, res) => {
  try {
    const result = await service.createTarget(req.body);
    res.json({
      success: result.data.status === '201',
      id: result.data.id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Targets
exports.getAll = async (_req, res) => {
  try {
    const result = await service.getTargets();
    const rawTargets = result.data.target || [];

    const targets = rawTargets.map(t => ({
      id: t.id,
      name: t.name,
      owner: t.owner?.name || 'unknown',
      hosts: t.hosts,
      port_list_name: t.port_list?.name || '',
      in_use: t.in_use === '1',
      creation_time: t.creation_time,
      modification_time: t.modification_time
    }));

    res.json(targets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get One Target
exports.getOne = async (req, res) => {
  try {
    const result = await service.getTarget(req.params.id);
    const t = result.data.target;

    const target = {
      id: t.id,
      name: t.name,
      owner: t.owner?.name || 'unknown',
      hosts: t.hosts,
      port_list_name: t.port_list?.name || '',
      port_list_id: t.port_list?.id || '',
      in_use: t.in_use === '1',
      max_hosts: t.max_hosts,
      allow_simultaneous_ips: t.allow_simultaneous_ips === '1',
      alive_tests: t.alive_tests,
      creation_time: t.creation_time,
      modification_time: t.modification_time
    };

    res.json(target);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Target
exports.update = async (req, res) => {
  try {
    const result = await service.updateTarget(req.params.id, req.body);
    res.json({
      success: true,
      message: result.data.message
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Target
exports.remove = async (req, res) => {
  try {
    const result = await service.deleteTarget(req.params.id);
    res.json({
      success: true,
      message: result.data.message
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};