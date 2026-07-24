import { broadcast, type SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { setStatus } from "./setStatus";
import type { OnStatusChange } from "./types";
import { wirePtyEvents } from "./wirePtyEvents";

export function respawnSession(
	session: Session,
	respawn: () => Session["pty"],
	status: Session["status"],
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
): void {
	session.gitWatcher?.close();
	session.gitWatcher = undefined;
	session.undurable = undefined;
	session.pendingDismiss = undefined;
	session.scrollback = "";
	session.startedAt = Date.now();
	session.runningMs = 0;
	session.runningSince = null;
	setStatus(session, status);
	session.restored = undefined;
	session.pty = respawn();
	if (session.cols && session.rows)
		try {
			session.pty?.resize(session.cols, session.rows);
		} catch {}
	broadcast(clients, { type: "clear", sessionId: session.id });
	wirePtyEvents(session, clients, onStatusChange);
}
