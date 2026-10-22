import fs from "fs";
import path from "path";
import { config } from "../config.js";

export function writeAudit(question, sourceUsed, trace = []) {
  try {
    const dir = path.dirname(config.auditLogPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let records = [];
    if (fs.existsSync(config.auditLogPath)) {
      try {
        const raw = fs.readFileSync(config.auditLogPath, "utf-8");
        records = JSON.parse(raw);
        if (!Array.isArray(records)) records = [];
      } catch {
        records = [];
      }
    }

    records.push({
      timestamp: new Date().toISOString(),
      question,
      sourceUsed,
      trace,
    });

    // Keep last 1000 records
    if (records.length > 1000) {
      records = records.slice(-1000);
    }

    fs.writeFileSync(config.auditLogPath, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("[Audit] Failed to write audit record:", err.message);
  }
}
