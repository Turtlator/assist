import type { Session } from "../createSession";
import { dismissSession } from "../dismissSession";
import { resolveCloseDurability } from "./resolveCloseDurability";
import { treeUnderClose } from "./treeUnderClose";

export function armStoppedSession(
	sessions: Map<string, Session>,
	session: Session,
	notify: () => void,
): void {
	void resolveCloseDurability(
		session,
		() => {
			if (dismissSession(sessions, session.id)) notify();
		},
		notify,
	);
}

export function rearmStoppedSessions(
	sessions: Map<string, Session>,
	notify: () => void,
): void {
	for (const s of sessions.values()) {
		if (s.status !== "stopped" || !treeUnderClose(s)) continue;
		armStoppedSession(sessions, s, notify);
	}
}
