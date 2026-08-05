import type { SessionInfo } from "./types";

export function canAddAgent(session: SessionInfo): boolean {
	if (!session.cwd || session.commandType === "run") return false;
	return session.closing !== true;
}
