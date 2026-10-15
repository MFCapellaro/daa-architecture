import { cp, mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

await rm("dist", { recursive: true, force: true });
const compiler = join("node_modules", "typescript", "bin", "tsc");
execFileSync(process.execPath, [compiler, "-p", "tsconfig.build.json"], { stdio: "inherit" });
const vite = join("node_modules", "vite", "bin", "vite.js");
execFileSync(process.execPath, [
  vite,
  "build",
  "apps/frontend",
  "--config",
  "apps/frontend/vite.config.ts",
  "--outDir",
  "../../dist/apps/frontend",
  "--emptyOutDir",
], { stdio: "inherit" });
await mkdir("dist", { recursive: true });
await cp("packages/domains/uas/participants/data", "dist/packages/domains/uas/participants/data", { recursive: true });
await cp("packages/domains/uas/ecosystem/data", "dist/packages/domains/uas/ecosystem/data", { recursive: true });