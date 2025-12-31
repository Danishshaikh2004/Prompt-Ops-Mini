import fs from "fs";
import path from "path";

const migrationsFilePath = path.join(process.cwd(), "data", "migrations.json");
const evaluationsFilePath = path.join(process.cwd(), "data", "evaluations.json");

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(migrationsFilePath)) {
  fs.writeFileSync(migrationsFilePath, JSON.stringify([], null, 2));
}

if (!fs.existsSync(evaluationsFilePath)) {
  fs.writeFileSync(evaluationsFilePath, JSON.stringify([], null, 2));
}

export function readMigrations() {
  try {
    const raw = fs.readFileSync(migrationsFilePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading migrations file:", error);
    return [];
  }
}

export function writeMigrations(data: any[]) {
  try {
    fs.writeFileSync(migrationsFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing migrations file:", error);
  }
}

export function readEvaluations() {
  try {
    const raw = fs.readFileSync(evaluationsFilePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading evaluations file:", error);
    return [];
  }
}

export function writeEvaluations(data: any[]) {
  try {
    fs.writeFileSync(evaluationsFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing evaluations file:", error);
  }
}
