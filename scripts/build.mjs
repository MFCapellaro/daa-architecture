import { cp, mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

await rm("dist", { recursive: true, force: true });
const compiler = join("node_modules", "typescript", "bin", "tsc");
execFileSync(process.execPath, [compiler, "-p", "tsconfig.build.json"], { stdio: "inherit" });
await mkdir("dist", { recursive: true });
await cp("data", "dist/data", { recursive: true });
await cp("apps/frontend", "dist/apps/frontend", { recursive: true });