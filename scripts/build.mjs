import { cp, mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join, relative, resolve, sep } from "node:path";

await rm("dist", { recursive: true, force: true });
const compiler = join("node_modules", "typescript", "bin", "tsc");
execFileSync(process.execPath, [compiler, "-p", "tsconfig.build.json"], { stdio: "inherit" });
await mkdir("dist", { recursive: true });
const frontendDirectory = resolve("apps/frontend");
await cp(frontendDirectory, "dist/apps/frontend", {
  recursive: true,
  filter: (source) => !relative(frontendDirectory, source)
    .split(sep)
    .some((segment) => segment === "node_modules" || segment.startsWith(".env")),
});
await cp("packages/domains/uas/participants/data", "dist/packages/domains/uas/participants/data", { recursive: true });
await cp("packages/domains/uas/ecosystem/data", "dist/packages/domains/uas/ecosystem/data", { recursive: true });