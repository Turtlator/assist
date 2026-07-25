import { existsSync } from "node:fs";
import { daemonLog } from "../daemonLog";
import { git, gitOrNull } from "./git";
import { mainWorktree } from "./listWorktreePaths";
import { forgetWorktree } from "./readWorktreeRegistry";
import { removeTree } from "./removeTree";
import { checkDurability } from "./treeDurability";

export async function reapWorktree(
	worktreePath: string,
	force = false,
): Promise<boolean> {
	if (!existsSync(worktreePath)) {
		daemonLog(`worktree ${worktreePath} already gone; skipping reap`);
		return false;
	}
	if (!force) {
		const durability = await checkDurability(worktreePath);
		if (!durability.durable) {
			daemonLog(`worktree ${worktreePath} not reaped: ${durability.reason}`);
			return false;
		}
	}
	const clone = mainWorktree(worktreePath) ?? worktreePath;
	const branch = await gitOrNull(worktreePath, [
		"symbolic-ref",
		"--short",
		"HEAD",
	]);
	if (!(await removeTree(clone, worktreePath, force))) return false;
	if (branch) await deleteBranch(clone, branch);
	forgetWorktree(worktreePath);
	daemonLog(`worktree ${worktreePath} reaped${force ? " (forced)" : ""}`);
	return true;
}

async function deleteBranch(clone: string, branch: string): Promise<void> {
	const current = await gitOrNull(clone, ["symbolic-ref", "--short", "HEAD"]);
	if (branch === current) return;
	try {
		await git(clone, ["branch", "-D", branch]);
	} catch {}
}
