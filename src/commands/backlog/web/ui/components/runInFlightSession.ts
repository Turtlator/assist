import { backlogTarget } from "../../../../sessions/web/ui/backlogTarget";
import type { SessionInfo } from "../../../../sessions/web/ui/types";
import { parseItemId } from "../../../formatItemId";

function argsTargetItem(session: SessionInfo, itemId: number): boolean {
	const args = session.assistArgs;
	if (args?.[0] !== "backlog" || args[1] !== "run" || !args[2]) return false;
	try {
		return parseItemId(args[2]) === itemId;
	} catch {
		return false;
	}
}

export function runInFlightSession(
	sessions: SessionInfo[],
	itemId: number,
): SessionInfo | undefined {
	return sessions.find(
		(session) =>
			session.status !== "done" &&
			session.status !== "error" &&
			(argsTargetItem(session, itemId) ||
				backlogTarget(session)?.itemId === itemId),
	);
}
