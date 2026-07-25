import type { SessionClient } from "./broadcast";
import { startHeldSession } from "./startHeldSession";
import type { OnStatusChange, Session } from "./types";
import type { TreeSpawnContext } from "./worktree/spawnInTree";

export function treeSpawnContext(
	sessions: Map<string, Session>,
	spawnWith: (create: (id: string) => Session) => string,
	notify: () => void,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
): TreeSpawnContext {
	return {
		sessions,
		spawnWith,
		notify,
		startHeld: (session) =>
			startHeldSession(session, sessions, clients, onStatusChange, notify),
	};
}
