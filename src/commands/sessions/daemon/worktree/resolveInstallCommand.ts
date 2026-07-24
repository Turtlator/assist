import { existsSync } from "node:fs";
import { join } from "node:path";

function detectInstallCommand(repoRoot: string): string | null {
	if (!existsSync(join(repoRoot, "package.json"))) return null;
	if (existsSync(join(repoRoot, "pnpm-lock.yaml"))) return "pnpm install";
	if (existsSync(join(repoRoot, "yarn.lock"))) return "yarn install";
	if (existsSync(join(repoRoot, "bun.lockb"))) return "bun install";
	return "npm install";
}

export function resolveInstallCommand(
	repoRoot: string,
	install: boolean | string,
): string | null {
	if (install === false) return null;
	if (typeof install === "string") return install;
	return detectInstallCommand(repoRoot);
}
