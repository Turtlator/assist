import type { SessionInfo } from "./types";

export function isTreeBeingRemoved(
	sessions: SessionInfo[],
	cwd: string,
): boolean {
	if (!cwd) return false;
	return sessions.some((s) => s.closing === true && s.cwd === cwd);
}
