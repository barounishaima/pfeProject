import api from "../utils/apiClient.js";

export const fetchAllGvmTasks = async () => {
  try {
    const response = await api.get("/tasks");
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch GVM tasks: ${error.message}`);
  }
};

export const getGvmResultIdForTask = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    //console.log(`[getGvmResultIdForTask] API response for task ${taskId}:`, JSON.stringify(response.data, null, 2));

    const task = response.data.task;
    if (!task) {
      throw new Error(`Task data not found in response for task ${taskId}`);
    }

    const lastReport = task.last_report?.report;
    if (!lastReport) {
      throw new Error(`No last report found for task ${taskId}`);
    }

    const reportId = lastReport.id;
    if (!reportId) {
      throw new Error(`No report ID found in last report for task ${taskId}`);
    }

    console.log(
      `[getGvmResultIdForTask] Found report ID ${reportId} for task ${taskId}`
    );
    return reportId;
  } catch (error) {
    console.error(
      `[getGvmResultIdForTask] Error fetching report ID for task ${taskId}:`,
      error.message
    );
    throw new Error(
      `Failed to get report ID for task ${taskId}: ${error.message}`
    );
  }
};

export const getReportByResultId = async (reportId, format = "xml") => {
  try {
    const response = await api.get(`/reports/${reportId}?format=${format}`, {
      responseType: "text", // Ensure response is treated as text
    });

    const data = response.data;
    //console.log(`[getReportByResultId] API response for report ${reportId}:`, data.slice(0, 200), '...');

    // Check for GVM error response
    if (
      typeof data === "string" &&
      data.includes('<get_reports_response status="400"')
    ) {
      throw new Error(`GVM API error: ${data}`);
    }

    // Validate GVM report structure
    if (
      typeof data !== "string" ||
      !data.includes('<get_reports_response status="200"') ||
      !data.includes('<report id="' + reportId)
    ) {
      throw new Error(
        `Response is not a valid GVM report: ${data.slice(0, 100)}...`
      );
    }

    return data;
  } catch (error) {
    console.error(
      `[getReportByResultId] Failed to get report for report ${reportId}:`,
      error.message
    );
    throw new Error(
      `Failed to get report for report ${reportId}: ${error.message}`
    );
  }
};
