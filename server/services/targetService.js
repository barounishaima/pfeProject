import api from "../utils/apiClient.js";
import Target from "../models/Target.js";

export const createTarget = async (data) => {
  try {
    // Step 1: Call external API to create the target
    const fastApiPayload = {
      name: data.Name,
      hosts: data.IpAdresses,
      exclude_hosts: data.exclude_hosts,
      comment: data.Comment || "",
      port_list_id: "4a4717fe-57d2-11e1-9a26-406186ea4fc5",
    };
    const TargetResponce = await api.post("/targets", fastApiPayload);
    const TargetId = TargetResponce.data.id;
    console.log("target id  :", TargetResponce);

    if (!TargetId) {
      throw new Error("FastAPI did not return a valid target ID.");
    }
    // Step 2: Save the target to MongoDB
    const target = new Target({
      TargetId: TargetId,
      Name: data.Name,
      Comment: data.Comment || "",
      IpAdresses: data.IpAdresses,
      exclude_hosts: data.exclude_hosts,
    });

    try {
      console.log(" Target being saved to Mongo:", target);
      await target.save();
    } catch (mongoErr) {
      console.error(" Error while saving target to MongoDB:", mongoErr);
      throw new Error("Failed to save target to MongoDB: " + mongoErr.message);
    }

    return target;
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.status_text
    ) {
      throw new Error(error.response.data.status_text);
    } else {
      throw new Error(`Failed to create target: ${error.message}`);
    }
  }
};

export const getTargets = async () => {
  try {
    const targets = await Target.find({});
    return targets;
  } catch (error) {
    throw new Error(`Failed to get targets: ${error.message}`);
  }
};

export const getTarget = async (id) => {
  try {
    const target = await Target.findOne({ TargetId: id });
    if (!target) {
      throw new Error(`Target with TargetId ${id} not found`);
    }
    return target;
  } catch (error) {
    throw new Error(`Failed to get target: ${error.message}`);
  }
};

export const updateTarget = async (id, data) => {
  try {
    // Step 1: Call external API to update the target
    await api.put(`/targets/${id}`, data);

    // Step 2: Update in MongoDB
    const updated = await Target.findOneAndUpdate(
      { TargetId: id },
      {
        Name: data.Name,
        Comment: data.Comment || "",
        IpAdresses: data.IpAdresses,
      },
      { new: true } // return updated document
    );

    if (!updated) {
      throw new Error(`Target with TargetId ${id} not found in MongoDB`);
    }

    return updated;
  } catch (error) {
    throw new Error(`Failed to update target: ${error.message}`);
  }
};

export const deleteTarget = async (id) => {
  try {
    // Step 1: Call external API to delete the target
    await api.delete(`/targets/${id}`);

    // Step 2: Delete from MongoDB
    const deleted = await Target.findOneAndDelete({ TargetId: id });

    if (!deleted) {
      throw new Error(`Target with TargetId ${id} not found in MongoDB`);
    }

    return deleted;
  } catch (error) {
    throw new Error(`Failed to delete target: ${error.message}`);
  }
};
