import { existsSync } from "node:fs";
import { basename } from "node:path";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { loadPersistedSessions } from "../loadPersistedSessions";
import { bindRestoredWorktrees } from "./bindNewWorktree";
import { git, listLocalBranches } from "./git";
import { readWorktreeRegistry } from "./readWorktreeRegistry";
import { reapWorktree } from "./reapWorktree";

export function reconcileWorktreesOnRestore(
	sessions: Map<string, Session>,
): void {
	bindRestoredWorktrees(sessions);
	void pruneWorktrees([...sessions.values()].map((s) => s.cwd));
}

async function pruneWorktrees(liveCwds: (string | undefined)[]): Promise<void> {
	const accounted = new Set<string>();
	for (const cwd of liveCwds) if (cwd) accounted.add(cwd);
	for (const s of loadPersistedSessions()) accounted.add(s.cwd);

	const clonesToPrune = new Set<string>();
	const orphanBranches: { clone: string; branch: string }[] = [];
	for (const { path, clone } of readWorktreeRegistry()) {
		if (accounted.has(path)) continue;
		if (!existsSync(path)) {
			clonesToPrune.add(clone);
			orphanBranches.push({ clone, branch: basename(path) });
			continue;
		}
		daemonLog(`worktree ${path} orphaned across restart; reconciling`);
		await reapWorktree(path);
	}

	for (const clone of clonesToPrune) {
		if (!existsSync(clone)) continue;
		try {
			await git(clone, ["worktree", "prune"]);
			daemonLog(`worktree bookkeeping pruned for clone ${clone}`);
		} catch {}
	}

	for (const { clone, branch } of orphanBranches)
		if (existsSync(clone)) await pruneStaleWorktreeBranch(clone, branch);
}

async function pruneStaleWorktreeBranch(
	clone: string,
	branch: string,
): Promise<void> {
	if (!listLocalBranches(clone).includes(branch)) return;
	try {
		await git(clone, ["branch", "-d", branch]);
		daemonLog(`stale worktree branch ${branch} pruned from clone ${clone}`);
	} catch {
		daemonLog(
			`stale worktree branch ${branch} retained (unmerged; surfaced not destroyed) in clone ${clone}`,
		);
	}
}
