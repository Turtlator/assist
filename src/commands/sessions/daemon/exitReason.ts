import { existsSync } from "node:fs";
import type { Session } from "./createSession";

export function exitReason(session: Session, exitCode: number): string {
	const base = `process exited with code ${exitCode}`;
	if (session.cwd && !existsSync(session.cwd))
		return `${base}: working directory ${session.cwd} no longer exists`;
	return base;
}
