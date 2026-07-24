import type { Session } from "../createSession";
import { dismissSession } from "../dismissSession";
import { resolveDoneDurability } from "./resolveDoneDurability";

export function rearmStoppedSessions(
	sessions: Map<string, Session>,
	notify: () => void,
): void {
	for (const s of sessions.values()) {
		if (s.status !== "stopped" || !s.worktree) continue;
		void resolveDoneDurability(
			s,
			() => {
				if (dismissSession(sessions, s.id)) notify();
			},
			notify,
		);
	}
}
