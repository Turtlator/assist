import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { runConfigBaseDirFrom } from "../../../shared/runConfigBaseDir";
import type { Session } from "./createSession";
import { resolveRunConfig } from "./resolveRunConfig";

export function exitDetail(session: Session): string | undefined {
	if (session.cwd && !existsSync(session.cwd))
		return `working directory ${session.cwd} no longer exists`;
	return missingRunConfigCwd(session);
}

export function exitReason(
	exitCode: number,
	detail: string | undefined,
): string {
	const base = `process exited with code ${exitCode}`;
	return detail ? `${base}: ${detail}` : base;
}

function missingRunConfigCwd(session: Session): string | undefined {
	if (session.commandType !== "run" || !session.runName) return undefined;
	const dir = session.cwd ?? process.cwd();
	const config = resolveRunConfig(session.runName, dir);
	if (!config?.cwd) return undefined;
	const configured = resolve(runConfigBaseDirFrom(dir), config.cwd);
	if (existsSync(configured)) return undefined;
	return `run config "${config.name}": cwd ${configured} does not exist`;
}
