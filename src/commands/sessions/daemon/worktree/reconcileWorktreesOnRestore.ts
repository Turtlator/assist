import { existsSync } from "node:fs";
import { basename } from "node:path";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { accountedTrees } from "./accountedTrees";
import { bindRestoredWorktrees } from "./bindNewWorktree";
import { readWorktreeRegistry } from "./readWorktreeRegistry";
import { reapWorktree } from "./reapWorktree";
import { reclaimVanishedWorktrees } from "./reclaimVanishedWorktrees";
import {
	type OrphanedWorktree,
	resurfaceOrphanedWorktree,
	type SpawnSession,
} from "./resurfaceOrphanedWorktree";
import { checkDurability } from "./treeDurability";

export function reconcileWorktreesOnRestore(
	sessions: Map<string, Session>,
	spawnWith: SpawnSession,
	notify: () => void,
): void {
	bindRestoredWorktrees(sessions);
	void recoverOrphanedWorktrees(sessions, spawnWith, notify);
}

async function recoverOrphanedWorktrees(
	sessions: Map<string, Session>,
	spawnWith: SpawnSession,
	notify: () => void,
): Promise<void> {
	const accounted = accountedTrees(sessions);
	const vanished = new Map<string, { path: string; branch: string }[]>();
	for (const { path, clone } of readWorktreeRegistry()) {
		if (accounted.has(path)) continue;
		if (!existsSync(path)) {
			vanished.set(clone, [
				...(vanished.get(clone) ?? []),
				{ path, branch: basename(path) },
			]);
			continue;
		}
		await recoverOrphan(sessions, spawnWith, { path, clone }, notify);
	}
	for (const [clone, paths] of vanished)
		await reclaimVanishedWorktrees(clone, paths);
}

async function recoverOrphan(
	sessions: Map<string, Session>,
	spawnWith: SpawnSession,
	orphan: OrphanedWorktree,
	notify: () => void,
): Promise<void> {
	daemonLog(`worktree ${orphan.path} orphaned across restart; reconciling`);
	const durability = await checkDurability(orphan.path);
	if (durability.durable) {
		await reapWorktree(orphan.path);
		return;
	}
	resurfaceOrphanedWorktree(
		sessions,
		spawnWith,
		orphan,
		durability.reason,
		notify,
	);
}
