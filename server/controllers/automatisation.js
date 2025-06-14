import dotenv from "dotenv";
dotenv.config();

import Scan from "../models/Scan.js";
import ReportSummary from "../models/ReportSummary.js";
import Vulnerability from "../models/Vulnerability.js";
import DefectDojoService from "../services/defectdojo.js";
import {
  fetchAllGvmTasks,
  getGvmResultIdForTask,
  getReportByResultId,
} from "../services/gvmService.js";
import { fetchRecentWazuhAlerts } from "../services/wazuh.js";
import { createCasesForUnlinkedVulnerabilities } from "../services/theHiveService.js";
import { createObservable } from "../services/observableService.js";
import { runAllAnalyzersForObservable } from "../services/cortexService.js";
import { parseStringPromise, Builder } from "xml2js";
import { convertAlertsToDefectDojoJSON } from '../services/wazuhTransformer.js';

// Use the default instance
const defectDojo = DefectDojoService;

// Helper to determine source type and ID
const determineSource = (finding) => {
  const tool = finding.tool?.toLowerCase();
  const uniqueId = finding.vuln_id_from_tool || finding.id;

  if (tool?.includes("gvm")) {
    return { type: "gvm", gvmResultId: uniqueId, wazuhAlertId: null };
  }
  if (tool?.includes("wazuh")) {
    return { type: "wazuh", gvmResultId: null, wazuhAlertId: uniqueId };
  }
  return { type: "mixed", gvmResultId: null, wazuhAlertId: null };
};

export const processFinishedScans = async (req, res) => {
  try {
    console.log("[processFinishedScans] Fetching all GVM tasks...");
    const rawTasksResponse = await fetchAllGvmTasks();
    const rawTasks = rawTasksResponse.task || rawTasksResponse || [];
    console.log(
      `[processFinishedScans] Retrieved ${rawTasks.length} tasks from GVM`
    );

    const newlyFinished = [];

    for (const task of rawTasks) {
      console.log(
        `[processFinishedScans] Processing task ID: ${task.id} status: ${task.status}`
      );
      const scan = await Scan.findOne({ scanId: task.id });
      if (!scan) {
        console.log(
          `[processFinishedScans] No scan entry for task ${task.id}, skipping.`
        );
        continue;
      }

      if (
        (scan.status === "Running" || scan.status === "pending") &&
        task.status === "Done"
      ) {
        console.log(
          `[processFinishedScans] Marking scan ${scan.scanId} as Done.`
        );
        scan.status = "Done";
        scan.finishedAt = new Date();
        await scan.save();
        newlyFinished.push(scan);

        console.log(
          `[processFinishedScans] Fetching GVM report ID for task ${task.id}...`
        );
        let reportId;
        try {
          reportId = await getGvmResultIdForTask(task.id);
          if (!reportId) {
            console.warn(
              `[processFinishedScans] No report ID for task ${task.id}, skipping.`
            );
            continue;
          }
        } catch (error) {
          console.error(
            `[processFinishedScans] Failed to fetch report ID for task ${task.id}: ${error.message}`
          );
          continue;
        }

        console.log(
          `[processFinishedScans] Fetching XML report for report ${reportId}...`
        );
        let reportXmlString;
        try {
          reportXmlString = await getReportByResultId(reportId);
          console.log(
            `[processFinishedScans] Report fetched, length=${
              reportXmlString.length
            }, type=${typeof reportXmlString}`
          );
        } catch (error) {
          console.error(
            `[processFinishedScans] Failed to fetch report for report ${reportId}: ${error.message}`
          );
          continue;
        }

        // Extract full <report> block that includes <results>
        let reportOnlyXml = null;
        try {
          const parsed = await parseStringPromise(reportXmlString);
          let rawReport = parsed?.get_reports_response?.report?.[0];

          if (rawReport?.report) {
            // Dig one level deeper into nested <report>
            rawReport = rawReport.report?.[0];
          }

          console.log("[DEBUG] rawReport keys:", Object.keys(rawReport));
          console.log(
            "[DEBUG] rawReport.results:",
            rawReport.results?.[0]?.result?.length || "no results"
          );

          if (
            !rawReport ||
            !rawReport.results ||
            !Array.isArray(rawReport.results) ||
            rawReport.results.length === 0
          ) {
            console.error(
              "[processFinishedScans] <report> found but it has no <results>."
            );
            continue;
          }

          const builder = new Builder();
          reportOnlyXml = builder.buildObject({ report: rawReport });

          console.log(
            `[processFinishedScans] Extracted <report> with ${
              rawReport.results?.[0]?.result?.length || 0
            } result entries`
          );
        } catch (error) {
          console.error(
            "[processFinishedScans] XML parsing failed:",
            error.message
          );
          continue;
        }

        let bySeverity = {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
        };
        let totalVulns = 0;

        try {
          const parsedReport = await parseStringPromise(reportOnlyXml);
          const results = parsedReport?.report?.results?.[0]?.result || [];

          for (const result of results) {
            const rawScore = parseFloat(result?.severity?.[0] || "0.0");
            if (isNaN(rawScore)) continue;

            let category = "info";
            if (rawScore >= 9.0) category = "critical";
            else if (rawScore >= 7.0) category = "high";
            else if (rawScore >= 4.0) category = "medium";
            else if (rawScore > 0.0) category = "low";

            bySeverity[category]++;
          }

          totalVulns = results.length;

          console.log(`[processFinishedScans] Parsed ${totalVulns} results`);
          console.log(`[processFinishedScans] Severity breakdown:`, bySeverity);
        } catch (error) {
          console.warn(
            "[processFinishedScans] Failed to parse report XML or extract severity:",
            error.message
          );
        }

        console.log("[processFinishedScans] Saving ReportSummary...");
        await ReportSummary.create({
          gvmResultId: reportId,
          totalVulns,
          bySeverity,
          scanId: scan.scanId,
          generatedAt: new Date(),
        });

        if (!scan.engagementId) {
          console.warn(
            `[processFinishedScans] No engagementId for scan ${scan.scanId}, skipping import.`
          );
          continue;
        }

        console.log(
          "[processFinishedScans] Importing GVM report to DefectDojo..."
        );
        let testId;
        try {
          const test = await defectDojo.importScan({
            file: reportOnlyXml,
            scanType: "OpenVAS Parser",
            engagementId: scan.engagementId,
          });
          testId = test.test;
          console.log(`[processFinishedScans] Received testId ${testId}`);
        } catch (err) {
          console.error(
            "[processFinishedScans] import-scan error:",
            err.message
          );
          continue;
        }

        console.log("[processFinishedScans] Fetching Wazuh alerts...");
        const alerts = await fetchRecentWazuhAlerts();
        const transformed = convertAlertsToDefectDojoJSON(alerts);
        console.log(
          `[processFinishedScans] Reimporting ${alerts.length} alerts to test ${testId}...`
        );
        const wazuhTest = await defectDojo.importScan({
          file: JSON.stringify(transformed),
          scanType: "Generic Findings Import",
          engagementId: scan.engagementId,
        });
        console.log(
          `[processFinishedScans] Result of sending wazuh to defect ${wazuhTest}...`
        );

        console.log(
          `[processFinishedScans] Retrieving findings for test ${testId} and ${wazuhTest.test}...`
        );
        const gvmFindings = await defectDojo.getTestFindings(testId);
        console.log(
          `[processFinishedScans] ${gvmFindings.length} gvmfindings retrieved.`
        );
        const wazuhFindings = await defectDojo.getTestFindings(wazuhTest.test);
        console.log(
          `[processFinishedScans] ${wazuhFindings.length} wazuhFindings retrieved.`
        );
        const allFindings = [
          ...gvmFindings.map(f => ({
            ...f,
            tool: 'gvm',
          })),
          ...wazuhFindings.map(f => ({
            ...f,
            tool: 'wazuh',
          }))
        ];

        let numberOfcases=allFindings.length;

        for (const finding of allFindings) {
          const vulnId = finding.id ;
          if (await Vulnerability.exists({ VulnerabilityId: vulnId })) {
            console.log(
              `[processFinishedScans] Vulnerability ${vulnId} exists, skip.`
            );
            numberOfcases--
            continue;
          }

          // Fallback CVE extraction logic
          const extractCVEs = (finding) => {
            const cves = new Set();
          
            const fieldsToSearch = [
              finding.cve,
              finding.unsaved_cve,
              finding.references,
              finding.title,
              finding.description,
            ];
          
            for (const field of fieldsToSearch) {
              if (typeof field === 'string') {
                const matches = field.match(/CVE-\d{4}-\d{4,7}/gi);
                if (matches) matches.forEach(cve => cves.add(cve));
              } else if (Array.isArray(field)) {
                field.forEach(item => {
                  if (typeof item === 'string') {
                    const matches = item.match(/CVE-\d{4}-\d{4,7}/gi);
                    if (matches) matches.forEach(cve => cves.add(cve));
                  }
                });
              }
            }
          
            return Array.from(cves);
          };
          console.log(`[processFinishedScans] Saving vulnerability ${vulnId}`);
          await Vulnerability.create({
            VulnerabilityId: vulnId,
            theHiveCaseId: "",
            Title: finding.title || "",
            Description: finding.description || "",
            Severity: finding.severity?.toLowerCase() || "info",
            CVE: extractCVEs(finding),
            statusVuln: true,
            source: determineSource(finding),
          });
        }

        console.log("[processFinishedScans] Creating TheHive cases...");
        const cases = (await createCasesForUnlinkedVulnerabilities()) || [];
        console.log(`[processFinishedScans] ${cases.length} cases created.`);

        for (const { caseId, vulnerability } of cases) {
          const observables = [];
          if (vulnerability.CVE?.length) {
            vulnerability.CVE.forEach((cve) =>
              observables.push({
                dataType: "other",           // fixed
                data: cve,
                ioc: false,
                tlp: 2,
                tags: ["cve"],
                message: `CVE Identifier ${cve}`
              })
            );
          }

          const source = vulnerability.source || {};

          if (source.gvmResultId) {
            observables.push({
              dataType: "other",
              data: source.gvmResultId,
              ioc: false,
              tlp: 2,
              tags: ['gvm'],
              message: `GVM result ID for finding ${vulnerability.VulnerabilityId}`
            });
          }

          

          if (source.wazuhAlertId) {
            observables.push({
              dataType: "other",
              data: source.wazuhAlertId,
              ioc: false,
              tlp: 2,
              tags: ['wazuh'],
              message: `Wazuh alert ID for finding ${vulnerability.VulnerabilityId}`
            });
          }

          for (const obs of observables) {
            try{
              console.log(
                `[processFinishedScans] Adding observable ${obs.data} to case ${caseId}`
              );
              const createdObs = await createObservable(caseId, obs);
              console.log(
                `[processFinishedScans] Running analyzers on observable ${createdObs.id}`
              );
              //await runAllAnalyzersForObservable(createdObs);
            }catch (error){
              console.error(`[processFinishedScans] Failed to add observable ${obs.data} to case ${caseId}:`, error.response?.data || error.message)
            }
          }
        }
      }

      if (scan.status !== task.status) {
        console.log(
          `[processFinishedScans] Sync status for scan ${scan.scanId}: ${task.status}`
        );
        scan.status = task.status;
        await scan.save();
      }
    }

    console.log(
      `[processFinishedScans] Completed. ${newlyFinished.length} scans processed.`
    );
    return res.json({ newlyFinished: newlyFinished.map(scan => scan.scanId) });
  } catch (err) {
    console.error("[processFinishedScans] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
