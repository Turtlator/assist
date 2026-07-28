import type { SessionSpawner } from "./makeSessionSpawner";
import { restoreAll } from "./restoreAll";
import type { Session } from "./types";
import { rearmStoppedSessions } from "./worktree/rearmStoppedSessions";
import { reconcileWorktreesOnRestore } from "./worktree/reconcileWorktreesOnRestore";

export function restoreAllSessions(
	spawner: SessionSpawner,
	sessions: Map<string, Session>,
	notify: () => void,
): string[] {
	const names = restoreAll(spawner, sessions);
	reconcileWorktreesOnRestore(sessions, spawner.recoveryCard, notify);
	rearmStoppedSessions(sessions, notify);
	return names;
}
