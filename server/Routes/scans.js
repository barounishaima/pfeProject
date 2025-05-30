const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const Scan = require("../models/Scan");

// Start scan
router.post("/start", async (req, res) => {
  const { targetName, targetHost } = req.body;

  const pythonProcess = spawn("python", [
    "./scripts/gvm_scan_now.py",
    "--host",
    process.env.GVM_HOST,
    "--port",
    process.env.GVM_PORT,
    "--username",
    process.env.GVM_USER,
    "--password",
    process.env.GVM_PASS,
    "--target_name",
    targetName,
    "--target_host",
    targetHost,
  ]);

  let result = "";
  pythonProcess.stdout.on("data", (data) => (result += data.toString()));

  pythonProcess.on("close", async (code) => {
    if (code !== 0)
      return res.status(500).json({ error: "Scan failed to start" });

    try {
      const output = JSON.parse(result);
      const newScan = new Scan({
        taskId: output.task_id,
        target: targetName,
        status: "running",
        type: "instant",
      });

      await newScan.save();
      res.json({ message: "Scan started successfully", scan: newScan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Get all scans
router.get("/", async (req, res) => {
  try {
    const scans = await Scan.find().sort("-createdAt");
    res.json(scans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
