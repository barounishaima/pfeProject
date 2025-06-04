const api = require('../utils/apiClient');
import Scan from '../models/Scan.js';
import { createEngagement } from './defectdojo.js';


//create a scan
export const createTask = async (data) => {
  try {
    // Step 1: Create the task in GVM
    const taskId = await api.post('/tasks', data);

    // Step 2: Create engagement in DefectDojo
    const engagementId = await createEngagement(data.name, new Date(data.createdAt));

    // Step 3: Save task to MongoDB (as a "Scan")
    const scan = new Scan({
      scanId: taskId, 
      name: data.name,
      status: data.status,
      targetId: data.targetId,
      scheduleId: data.scheduleId || null,
      engagementId: engagementId,
      createdAt: new Date(data.createdAt),
      finishedAt: data.finishedAt ? new Date(data.finishedAt) : null,
    });

    await scan.save();

    return scan;
  } catch (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }
};

//get all scans
export const getTasks = async () => {
  try {
    const tasks = await Scan.find({});
    return tasks;
  } catch (error) {
    throw new Error(`Failed to get tasks: ${error.message}`);
  }
};

//get a single scan by ID
export const getTask = async (id) => {
  try {
    const task = await Scan.findOne({ scanId: id });
    if (!task) {
      throw new Error(`Task with scanId ${id} not found`);
    }
    return task;
  } catch (error) {
    throw new Error(`Failed to get task: ${error.message}`);
  }
};

//update a scan
export const updateTask = async (id, data) => {
  try {
    // Step 1: Update the task in the GVM API
    await api.put(`/tasks/${id}`, data);

    // Step 2: Update the task in MongoDB
    const updated = await Scan.findOneAndUpdate(
      { scanId: id },
      {
        name: data.name,
        status: data.status,
        targetId: data.targetId,
        scheduleId: data.scheduleId || null,
        finishedAt: data.finishedAt ? new Date(data.finishedAt) : null,
      },
      { new: true } // Return the updated document
    );

    if (!updated) {
      throw new Error(`Task with scanId ${id} not found in MongoDB`);
    }

    return updated;
  } catch (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }
};


//delete a scan
export const deleteTask = async (id) => {
  try {
    // Step 1: Delete the task in the GVM API
    await api.delete(`/tasks/${id}`);

    // Step 2: Delete the task from MongoDB
    const deleted = await Scan.findOneAndDelete({ scanId: id });

    if (!deleted) {
      throw new Error(`Task with scanId ${id} not found in MongoDB`);
    }

    return deleted;
  } catch (error) {
    throw new Error(`Failed to delete task: ${error.message}`);
  }
};


exports.startTask = (id) => api.post(`/tasks/${id}/start`);