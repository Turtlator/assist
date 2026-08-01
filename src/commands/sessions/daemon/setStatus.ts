import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

/* why: the card timer must count only time spent running. Funnelling every
 * status write through here keeps runningMs the single source of truth: the
 * elapsed running stretch is folded in on the way out of running, and a fresh
 * runningSince is stamped on the way in, so the total holds steady while
 * waiting/error and resumes without jumping. */
export function setStatus(
	session: Session,
	newStatus: Session["status"],
): void {
	const now = Date.now();
	if (session.status === "running" && session.runningSince != null) {
		session.runningMs += now - session.runningSince;
	}
	session.runningSince = newStatus === "running" ? now : null;
	session.waitingSince = newStatus === "waiting" ? now : null;
	session.status = newStatus;
	if (newStatus !== "running" && session.verifying) {
		session.verifying = false;
		daemonLog(`session ${session.id} verifying cleared: status=${newStatus}`);
	}
	if (newStatus === "waiting") {
		daemonLog(
			`session ${session.id} waiting since ${new Date(now).toISOString()}`,
		);
	}
}
