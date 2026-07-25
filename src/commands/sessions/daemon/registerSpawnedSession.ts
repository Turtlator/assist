import type { SessionClient } from "./broadcast";
import { logSpawnedSession } from "./logSpawnedSession";
import type { OnStatusChange, Session } from "./types";
import { wirePtyEvents } from "./wirePtyEvents";
import { wireSessionWatchers } from "./wireSessionWatchers";

export function registerSpawnedSession(
	session: Session,
	sessions: Map<string, Session>,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
	notify: () => void,
): string {
	sessions.set(session.id, session);
	wirePtyEvents(session, clients, onStatusChange);
	notify();
	wireSessionWatchers(session, notify, onStatusChange);
	logSpawnedSession(session);
	return session.id;
}
