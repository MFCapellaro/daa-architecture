import { cp, mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";

await rm("dist", { recursive: true, force: true });
if (process.platform === "win32") {
	execFileSync(process.env.ComSpec, ["/d", "/s", "/c", "npx tsc -p tsconfig.build.json"], { stdio: "inherit" });
} else {
	execFileSync("npx", ["tsc", "-p", "tsconfig.build.json"], { stdio: "inherit" });
}
await mkdir("dist", { recursive: true });
await cp("data", "dist/data", { recursive: true });
await cp("apps/frontend", "dist/apps/frontend", { recursive: true });