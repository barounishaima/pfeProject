import api from '../utils/apiClient.js';
import Schedule from '../models/Schedule.js'


// create schedule
export const createSchedule = async (data) => {
  try {
    // Step 1: Make API call to external system
    const schedualId = await api.post('/schedules', data);

    // Step 2: Save the schedule to MongoDB
    const schedule = new Schedule({
      schedualId: schedualId,
      name: data.name,
      comment: data.comment || '',
      startDate: new Date(data.startDate),
      finishDate: new Date(data.finishDate),
    });

    await schedule.save();

    return schedule;
  } catch (error) {
    throw new Error(`Failed to create schedule: ${error.message}`);
  }
};


// Get all schedules
export const getSchedules = async () => {
  try {
    const schedules = await Schedule.find({});
    return schedules;
  } catch (error) {
    throw new Error(`Failed to get schedules: ${error.message}`);
  }
};

// Get a single schedule by ID
export const getSchedule = async (id) => {
  try {
    const schedule = await Schedule.findOne({ schedualId: id });
    if (!schedule) {
      throw new Error(`Schedule with schedualId ${id} not found`);
    }
    return schedule;
  } catch (error) {
    throw new Error(`Failed to get schedule: ${error.message}`);
  }
};

// Update a schedule
export const updateSchedule = async (id, data) => {
  try {
    // Step 1: Update in the external system via API
    await api.put(`/schedules/${id}`, data);

    // Step 2: Update in MongoDB
    const updated = await Schedule.findOneAndUpdate(
      { schedualId: id },
      {
        name: data.name,
        comment: data.comment || '',
        startDate: new Date(data.startDate),
        finishDate: new Date(data.finishDate),
      },
      { new: true } // Return the updated document
    );

    if (!updated) {
      throw new Error(`Schedule with schedualId ${id} not found in MongoDB`);
    }

    return updated;
  } catch (error) {
    throw new Error(`Failed to update schedule: ${error.message}`);
  }
};

// Delete a schedule 
export const deleteSchedule = async (id) => {
  try {
    // Step 1: Delete from external system via API
    await api.delete(`/schedules/${id}`);

    // Step 2: Delete from MongoDB
    const deleted = await Schedule.findOneAndDelete({ schedualId: id });

    if (!deleted) {
      throw new Error(`Schedule with schedualId ${id} not found in MongoDB`);
    }

    return deleted;
  } catch (error) {
    throw new Error(`Failed to delete schedule: ${error.message}`);
  }
};