import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { flushPhaseActiveMs } from "./flushPhaseActiveMs";
import { setStatus } from "./setStatus";
import { shouldAutoDismiss } from "./shouldAutoDismiss";
import { shouldAutoRun } from "./shouldAutoRun";
import { resolveDoneDurability } from "./worktree/resolveDoneDurability";

type StatusChangeDeps = {
	dismiss: (id: string) => void;
	notify: () => void;
	reuseForRun: (session: Session, itemId: number) => void;
};

export function applyStatusChange(
	session: Session,
	status: Session["status"],
	exitCode: number | undefined,
	dismiss: (id: string) => void,
	notify: () => void,
	reuseForRun: (session: Session, itemId: number) => void,
): void {
	/* why: Claude Code hooks re-assert "running" on every tool call; if the status
	 * is unchanged there is nothing to broadcast or auto-dismiss, so skip the work
	 * to avoid a broadcast storm during a long tool-heavy turn. */
	if (session.status === status) return;
	const deps = { dismiss, notify, reuseForRun };
	if (status === "done" && session.worktree) {
		void resolveDoneDurability(
			session,
			() => finishStatusChange(session, "done", exitCode, deps),
			notify,
		);
		return;
	}
	finishStatusChange(session, status, exitCode, deps);
}

function finishStatusChange(
	session: Session,
	status: Session["status"],
	exitCode: number | undefined,
	deps: StatusChangeDeps,
): void {
	daemonLog(`session ${session.id} status: ${session.status} -> ${status}`);
	void flushPhaseActiveMs(session);
	setStatus(session, status);
	if (status !== "waiting") session.undurable = undefined;
	const autoRun = shouldAutoRun(session);
	if (autoRun.run) {
		deps.reuseForRun(session, autoRun.itemId);
		deps.notify();
		return;
	}
	if (status === "done" && autoRun.reason != null) {
		daemonLog(
			`session ${session.id} auto-run enabled but skipped (exit ${exitCode ?? "none"}): ${autoRun.reason}`,
		);
	}
	if (shouldAutoDismiss(session, exitCode)) deps.dismiss(session.id);
	else deps.notify();
}
