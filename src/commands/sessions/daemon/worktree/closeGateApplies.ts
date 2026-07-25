import type { Session } from "../createSession";
import { otherTreeHolders } from "./otherTreeHolders";
import { worktreeConfigFor } from "./worktreeConfigFor";

export function closeGateApplies(
	sessions: Map<string, Session>,
	session: Session,
): boolean {
	if (otherTreeHolders(sessions, session).length > 0) return false;
	if (session.worktree) return true;
	if (!session.cwd) return false;
	if (session.status !== "running" && session.status !== "waiting")
		return false;
	return worktreeConfigFor(session.cwd).enabled === true;
}
