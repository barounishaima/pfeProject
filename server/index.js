import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { userRoutes } from "./Routes/Users.js";
import { connectDB } from "./utils/db.js"; // Import the connection function
import { adminRouter } from "./Routes/AdminRoute.js";
import helmet from "helmet";
import defectdojoRoutes from "./Routes/defectdojo.js";
import wazuhRouter from "./Routes/wazuh.js";
import http from "http";
import targetRouter from "./Routes/targetRoutes.js";
import scheduleRouter from "./Routes/scheduleRoutes.js";
import taskRouter from "./Routes/taskRoutes.js";
import caseRouter from "./Routes/caseRoutes.js";
import autoRouter from "./Routes/autoRoute.js";

const app = express();

// CORS Configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
connectDB(); // Add this line to establish the connection

// Routes
app.use("/api/users", userRoutes);
app.use("/auth", adminRouter);
app.use("/api/defectdojo", defectdojoRoutes);
app.use("/api/wazuh", wazuhRouter);
app.use("/api/targets", targetRouter);
app.use("/api/schedules", scheduleRouter);
app.use("/api/scans", taskRouter);
app.use("/api", caseRouter);
app.use("/api/auto", autoRouter);

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
