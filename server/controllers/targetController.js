//controllers/targetController.js

import * as service from'../services/targetService.js';

// Format a Target document into API-friendly response
const formatTarget = (target) => ({
  id: target.TargetId,
  name: target.Name,
  comment: target.Comment || '',
  ipAddresses: target.IpAdresses || [],
  createdAt: target.createdAt,
  updatedAt: target.updatedAt,
});

// Create Target
export const create = async (req, res) => {
  try {
    const target = await service.createTarget(req.body);
    res.json({
      success: true,
      id: target.TargetId,
      message: 'Target created successfully',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Targets
export const getAll = async (_req, res) => {
  try {
    const targets = await service.getTargets();
    res.json(targets.map(formatTarget));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get One Target
export const getOne = async (req, res) => {
  try {
    const target = await service.getTarget(req.params.id);
    res.json(formatTarget(target));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Target
export const update = async (req, res) => {
  try {
    const updated = await service.updateTarget(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Target updated successfully',
      updated: formatTarget(updated),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Target
export const remove = async (req, res) => {
  try {
    const deleted = await service.deleteTarget(req.params.id);
    res.json({
      success: true,
      message: 'Target deleted successfully',
      deletedId: deleted.TargetId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
