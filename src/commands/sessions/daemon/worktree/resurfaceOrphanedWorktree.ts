import { basename } from "node:path";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { sessionBase } from "../sessionBase";
import { armStoppedSession } from "./rearmStoppedSessions";

export type OrphanedWorktree = { path: string; clone: string };

export type SpawnSession = (create: (id: string) => Session) => string;

export function resurfaceOrphanedWorktree(
	sessions: Map<string, Session>,
	spawnWith: SpawnSession,
	orphan: OrphanedWorktree,
	reason: string,
	notify: () => void,
): void {
	let id: string;
	try {
		id = spawnWith((sid) => orphanedSession(sid, orphan, reason));
	} catch (error) {
		daemonLog(
			`orphaned worktree ${orphan.path} left in place, no card available: ${error instanceof Error ? error.message : String(error)}`,
		);
		return;
	}
	daemonLog(
		`orphaned worktree ${orphan.path} resurfaced as stopped session ${id}: ${reason}`,
	);
	const session = sessions.get(id);
	if (session) armStoppedSession(sessions, session, notify);
	notify();
}

function orphanedSession(
	id: string,
	orphan: OrphanedWorktree,
	reason: string,
): Session {
	return {
		...sessionBase(id, "stopped"),
		name: basename(orphan.path),
		subtitle: `recovered workspace — ${reason}`,
		commandType: "claude",
		pty: null,
		cwd: orphan.path,
		worktree: { path: orphan.path, clone: orphan.clone },
		undurable: { reason, removesTree: true },
		scrollback: recoveryNotice(orphan.path, reason),
	};
}

function recoveryNotice(path: string, reason: string): string {
	return [
		`\r\n\x1b[33mRecovered workspace ${path}\x1b[0m\r\n`,
		`Its session is gone but the workspace still holds ${reason}.\r\n`,
		"It is removed on its own once the work lands; restart to put an agent back in it, or discard to delete it.\r\n",
	].join("");
}
