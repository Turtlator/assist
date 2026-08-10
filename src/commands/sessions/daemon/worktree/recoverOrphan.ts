import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { describeHeldWork } from "./describeHeldWork";
import { reapWorktree } from "./reapWorktree";
import type { SpawnSession } from "../types";
import {
	type OrphanedWorktree,
	resurfaceOrphanedWorktree,
} from "./resurfaceOrphanedWorktree";
import { checkDurability } from "./treeDurability";

export async function recoverOrphan(
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
