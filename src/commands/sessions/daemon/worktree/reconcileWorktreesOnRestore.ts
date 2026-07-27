import { existsSync } from "node:fs";
import { basename } from "node:path";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { accountedTrees } from "./accountedTrees";
import { bindRestoredWorktrees } from "./bindNewWorktree";
import { describeHeldWork } from "./describeHeldWork";
import { readWorktreeRegistry } from "./readWorktreeRegistry";
import { reapWorktree } from "./reapWorktree";
import { reclaimVanishedWorktrees } from "./reclaimVanishedWorktrees";
import {
	type OrphanedWorktree,
	resurfaceOrphanedWorktree,
	type SpawnSession,
} from "./resurfaceOrphanedWorktree";
import { checkDurability } from "./treeDurability";
import { logVanishedTree } from "./logVanishedTree";

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
		if (!existsSync(path)) {
			logVanishedTree(sessions, path);
			vanished.set(clone, [
				...(vanished.get(clone) ?? []),
				{ path, branch: basename(path) },
			]);
			continue;
		}
		if (accounted.has(path)) continue;
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
	const held = await describeHeldWork(orphan.path, durability.reason);
	resurfaceOrphanedWorktree(
		sessions,
		spawnWith,
		{ orphan, reason: durability.reason, held },
		notify,
	);
}
