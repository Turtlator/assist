import { daemonLog } from "../daemonLog";
import { git } from "./git";

export async function removeTree(
	clone: string,
	worktreePath: string,
	force: boolean,
): Promise<boolean> {
	const remove = (forced: boolean) =>
		git(clone, [
			"worktree",
			"remove",
			...(forced ? ["--force"] : []),
			worktreePath,
		]);
	try {
		await remove(force);
		return true;
	} catch (error) {
		daemonLog(`worktree ${worktreePath} removal failed: ${reason(error)}`);
	}
	if (force) return false;
	return await removeIgnoringLeftovers(remove, worktreePath);
}

async function removeIgnoringLeftovers(
	remove: (forced: boolean) => Promise<string>,
	worktreePath: string,
): Promise<boolean> {
	try {
		await remove(true);
		daemonLog(
			`worktree ${worktreePath} removed on retry; only ignored files remained, its work is landed`,
		);
		return true;
	} catch (error) {
		daemonLog(
			`worktree ${worktreePath} left in place for the next reconcile: ${reason(error)}`,
		);
		return false;
	}
}

function reason(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
