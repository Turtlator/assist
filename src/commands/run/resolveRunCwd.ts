import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { runConfigBaseDir } from "../../shared/runConfigBaseDir";
import type { RunConfig } from "../../shared/types";

export class MissingRunCwdError extends Error {
	constructor(
		readonly runName: string,
		readonly cwd: string,
	) {
		super(`run config "${runName}": cwd ${cwd} does not exist`);
		this.name = "MissingRunCwdError";
	}
}

export function resolveRunCwd(
	config: Pick<RunConfig, "name" | "cwd">,
	baseDir: string = runConfigBaseDir(),
): string | undefined {
	if (!config.cwd) return undefined;
	const cwd = resolve(baseDir, config.cwd);
	if (!existsSync(cwd)) throw new MissingRunCwdError(config.name, cwd);
	return cwd;
}
