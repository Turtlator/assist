import type { SessionInfo } from "./types";

export function canAddAgent(session: SessionInfo): boolean {
	if (!session.cwd || session.commandType === "run") return false;
	if (session.closing === true) return false;
	return session.status === "running" || session.status === "waiting";
}
