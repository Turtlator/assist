import { findRepoRoot } from "../../../../shared/findRepoRoot";
import { createWatcherSession } from "../createWatcherSession";
import { daemonLog } from "../daemonLog";
import type { Session } from "../types";
import { allocateAndBind, type TreeSpawnContext } from "./allocateAndBind";
import { mainWorktree } from "./listWorktreePaths";
import { worktreeConfigFor } from "./worktreeConfigFor";

export function ensureWatcher(
	ctx: TreeSpawnContext,
	cwd: string | undefined,
	launchedFrom?: string,
): string | undefined {
	if (!cwd) return undefined;
	const repoRoot = findRepoRoot(cwd) ?? cwd;
	const cfg = worktreeConfigFor(repoRoot);
	if (!cfg.enabled || cfg.watcher !== true) return undefined;
	const clone = mainWorktree(repoRoot) ?? repoRoot;
	const live = liveWatcherFor(ctx.sessions, clone);
	if (live) {
		daemonLog(
			`no watcher spawned for the clone ${clone}: session ${live.id} is already watching it (${live.status})`,
		);
		return undefined;
	}
	const id = allocateAndBind(
		ctx,
		clone,
		(sid, resolvedCwd) => createWatcherSession(sid, resolvedCwd ?? clone),
		{ inPlace: true },
		{ launchedFrom },
	);
	daemonLog(
		`spawned watcher session ${id} running /watch in the clone ${clone}`,
	);
	return id;
}

function liveWatcherFor(
	sessions: Map<string, Session>,
	clone: string,
): Session | undefined {
	for (const session of sessions.values())
		if (
			session.watcher === true &&
			session.cwd === clone &&
			session.status !== "stopped" &&
			session.status !== "error"
		)
			return session;
	return undefined;
}
