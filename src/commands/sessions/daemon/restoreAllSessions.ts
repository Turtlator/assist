import { restoreAll } from "./restoreAll";
import type { Session } from "./types";
import { rearmStoppedSessions } from "./worktree/rearmStoppedSessions";
import { reconcileWorktreesOnRestore } from "./worktree/reconcileWorktreesOnRestore";

export function restoreAllSessions(
	spawnWith: (create: (id: string) => Session) => string,
	sessions: Map<string, Session>,
	notify: () => void,
): string[] {
	const names = restoreAll(spawnWith, sessions);
	reconcileWorktreesOnRestore(sessions, spawnWith, notify);
	rearmStoppedSessions(sessions, notify);
	return names;
}
