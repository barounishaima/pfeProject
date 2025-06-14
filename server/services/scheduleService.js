import api from "../utils/apiClient.js";
import Schedule from "../models/Schedule.js";

// create schedule
const formatToICalUTC = (date) => {
  return new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};
export const createSchedule = async (data) => {
  try {
    // Step 1: Make API call to external system
    const fastApiPayload = {
      name: data.name,
      comment: data.comment || "",
      time: formatToICalUTC(data.startDate),
      period: "FREQ=DAILY",
      until: formatToICalUTC(data.finishDate),
      timezone: "UTC",
    };

    const result = await api.post("/schedules", fastApiPayload);
    const scheduleId = result.data.id;
    console.log("schedule_id :", scheduleId);

    // Step 2: Save the schedule to MongoDB
    const schedule = new Schedule({
      scheduleId: scheduleId,
      name: data.name,
      comment: data.comment || "",
      startDate: new Date(data.startDate),
      finishDate: new Date(data.finishDate),
    });

    try {
      console.log(" schedule being saved to Mongo:", schedule);
      await schedule.save();
    } catch (mongoErr) {
      console.error(" Error while saving schedule to MongoDB:", mongoErr);
      throw new Error(
        "Failed to save schedule to MongoDB: " + mongoErr.message
      );
    }

    return schedule;
  }  catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.status_text
    ) {
      throw new Error(error.response.data.status_text);
    } else {
      throw new Error(`Failed to create schedule: ${error.message}`);
    }
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
    const schedule = await Schedule.findOne({ scheduleId: id });
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
      { scheduleId: id },
      {
        name: data.name,
        comment: data.comment || "",
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
    const deleted = await Schedule.findOneAndDelete({ scheduleId: id });

    if (!deleted) {
      throw new Error(`Schedule with schedualId ${id} not found in MongoDB`);
    }

    return deleted;
  } catch (error) {
    throw new Error(`Failed to delete schedule: ${error.message}`);
  }
};
