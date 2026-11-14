import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(frontendRoot, "..");
const sourceDirectory = resolve(repositoryRoot, "data", "processed");
const destinationDirectory = resolve(frontendRoot, "public", "data");

await mkdir(destinationDirectory, { recursive: true });

for (const filename of [
  "annual_environmental_indicators_2000_2025.csv",
  "trend_summary_2000_2025.json",
]) {
  await copyFile(resolve(sourceDirectory, filename), resolve(destinationDirectory, filename));
}

console.log("Copied processed analysis artifacts to frontend/public/data.");
