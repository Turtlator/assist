import { existsSync } from "node:fs";
import { basename } from "node:path";
import { daemonLog } from "../daemonLog";
import { git, gitOrNull } from "./git";
import { listLocalBranches, mainWorktree } from "./listWorktreePaths";
import {
	forgetWorktree,
	worktreeAttributionIncludingReaped,
} from "./readWorktreeRegistry";
import { removeTree } from "./removeTree";
import type { TreeRemoval } from "./TreeRemoval";
import { stopInstall } from "./stopInstall";
import { checkDurability } from "./treeDurability";

export async function reapWorktree(
	worktreePath: string,
	force = false,
): Promise<TreeRemoval> {
	if (!existsSync(worktreePath)) {
		forgetWorktree(worktreePath);
		daemonLog(
			`worktree ${worktreePath} already gone; its record was forgotten`,
		);
		return { removed: true };
	}
	if (!force) {
		const durability = await checkDurability(worktreePath);
		if (!durability.durable) {
			daemonLog(`worktree ${worktreePath} not reaped: ${durability.reason}`);
			return { removed: false, reason: durability.reason };
		}
	}
	stopInstall(worktreePath);
	const clone = owningClone(worktreePath);
	const removal = await removeTree(clone, worktreePath, force);
	if (!removal.removed) return removal;
	await deleteWorktreeBranch(clone, basename(worktreePath));
	forgetWorktree(worktreePath);
	daemonLog(`worktree ${worktreePath} reaped${force ? " (forced)" : ""}`);
	return removal;
}

function owningClone(worktreePath: string): string {
	const recorded = worktreeAttributionIncludingReaped(worktreePath)?.clone;
	if (recorded && existsSync(recorded)) return recorded;
	const detected = mainWorktree(worktreePath);
	if (detected) return detected;
	daemonLog(
		`worktree ${worktreePath} has no resolvable clone; tearing it down on its own`,
	);
	return worktreePath;
}

async function deleteWorktreeBranch(
	clone: string,
	branch: string,
): Promise<void> {
	if (!listLocalBranches(clone).includes(branch)) return;
	const current = await gitOrNull(clone, ["symbolic-ref", "--short", "HEAD"]);
	if (branch === current) return;
	try {
		await git(clone, ["branch", "-D", branch]);
		daemonLog(`worktree branch ${branch} deleted from clone ${clone}`);
	} catch (error) {
		daemonLog(
			`worktree branch ${branch} retained in clone ${clone}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
