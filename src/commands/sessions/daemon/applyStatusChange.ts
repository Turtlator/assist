import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { endsStreamLife } from "./endsStreamLife";
import { resolveCloseDurability } from "./worktree/resolveCloseDurability";
import { finishStatusChange } from "./finishStatusChange";

export function applyStatusChange(
	session: Session,
	status: Session["status"],
	exitCode: number | undefined,
	dismiss: (id: string) => void,
	notify: () => void,
	reuseForRun: (session: Session, itemId: number) => void,
	sharedWithOtherAgents: (session: Session) => boolean = () => false,
): void {
	/* why: Claude Code hooks re-assert "running" on every tool call; if the status
	 * is unchanged there is nothing to broadcast or auto-dismiss, so skip the work
	 * to avoid a broadcast storm during a long tool-heavy turn. */
	if (session.status === status) return;
	const deps = { dismiss, notify, reuseForRun };
	if (endsStreamLife(session, status, sharedWithOtherAgents)) {
		session.closing = true;
		daemonLog(
			`session ${session.id} closing: checking durability of ${session.worktree?.path} before reap`,
		);
		notify();
		void resolveCloseDurability(
			session,
			() => finishStatusChange(session, "done", exitCode, deps),
			notify,
		);
		return;
	}
	finishStatusChange(session, status, exitCode, deps);
}
