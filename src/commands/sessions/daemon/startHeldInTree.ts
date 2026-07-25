import type { SessionClient } from "./broadcast";
import { startHeldSession } from "./startHeldSession";
import type { OnStatusChange, Session } from "./types";

export function startHeldInTree(
	seeded: Session,
	sessions: Map<string, Session>,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
	notify: () => void,
): void {
	const start = (session: Session) =>
		startHeldSession(session, sessions, clients, onStatusChange, notify);
	start(seeded);
	for (const session of sessions.values())
		if (
			session !== seeded &&
			session.pendingStart &&
			session.cwd === seeded.cwd
		)
			start(session);
}
