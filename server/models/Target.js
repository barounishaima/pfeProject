// models/Target.js
import mongoose from "mongoose";

const targetSchema = new mongoose.Schema(
  {
    TargetId: {
      type: String,
      required: true,
      unique: true,
    },
    Name: {
      type: String,
      required: true,
    },
    Comment: {
      type: String,
      default: "",
    },
    IpAdresses: {
      type: [String], // Array of strings
      required: true,
      validate: [
        (array) => array.length > 0,
        "At least one IP address is required",
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Target", targetSchema);
