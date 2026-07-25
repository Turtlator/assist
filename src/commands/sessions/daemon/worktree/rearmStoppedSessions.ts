import type { Session } from "../createSession";
import { dismissSession } from "../dismissSession";
import { resolveCloseDurability } from "./resolveCloseDurability";
import { treeUnderClose } from "./treeUnderClose";

export function rearmStoppedSessions(
	sessions: Map<string, Session>,
	notify: () => void,
): void {
	for (const s of sessions.values()) {
		if (s.status !== "stopped" || !treeUnderClose(s)) continue;
		void resolveCloseDurability(
			s,
			() => {
				if (dismissSession(sessions, s.id)) notify();
			},
			notify,
		);
	}
}
