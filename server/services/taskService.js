import api from '../utils/apiClient.js';
import Scan from '../models/Scan.js';
import DefectDojoService from '../services/defectdojo.js';


// Create a scan
export const createTask = async (data) => {
  try {
    console.log('Starting task creation with data:', JSON.stringify(data, null, 2));

    // Step 1: Create the task in GVM
    console.log('Attempting GVM task creation...');
    const response = await api.post('/tasks', data);
    const taskId = response.data.id;
    console.log('GVM task created with ID:', taskId);

    // Step 2: Create engagement in DefectDojo
    console.log('Creating DefectDojo engagement...');
    const createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    const engagementId = await DefectDojoService.createEngagement(1,data.name, createdAt);
    console.log('DefectDojo engagement created with ID:', engagementId);

    // Step 3: Save task to MongoDB
    console.log('Creating MongoDB scan record...');
    console.log(data.schedule_id);
    const scan = new Scan({
      scanId: taskId,
      name: data.name,
      comment: data.comment,
      status: 'pending', // default status
      target_Id: data.target_id,
      schedule_Id: data.schedule_id,
      engagementId: engagementId,
      createdAt: new Date(data.createdAt || Date.now()), // default to now
      finishedAt: data.finishedAt ? new Date(data.finishedAt) : null,
    });

    await scan.save();
    console.log('Scan saved successfully:', scan);

    return scan;
  } catch (error) {
    console.error('Full error in createTask:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    throw new Error(`Failed to create task: ${error.message}`);
  }
};

// Get all scans
export const getTasks = async () => {
  try {
    const tasks = await Scan.find({});
    return tasks;
  } catch (error) {
    throw new Error(`Failed to get tasks: ${error.message}`);
  }
};

// Get a single scan by ID
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

// Update a scan
export const updateTask = async (id, data) => {
  try {
    // Step 1: Update the task in the GVM API
    await api.put(`/tasks/${id}`, data);

    // Step 2: Update the task in MongoDB
    const updated = await Scan.findOneAndUpdate(
      { scanId: id },
      {
        name: data.name,
        comment: data.comment,
        status: data.status,
        targetId: data.targetId,
        scheduleId: data.scheduleId || null,
        finishedAt: data.finishedAt ? new Date(data.finishedAt) : null,
      },
      { new: true }
    );

    if (!updated) {
      throw new Error(`Task with scanId ${id} not found in MongoDB`);
    }

    return updated;
  } catch (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }
};

// Delete a scan
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

// Start a task
export const startTask = (id) => api.post(`/tasks/${id}/start`);
