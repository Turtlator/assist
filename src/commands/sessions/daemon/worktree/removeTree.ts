import { daemonLog } from "../daemonLog";
import { deleteStrandedTree } from "./deleteStrandedTree";
import { deleteTreeDirectly } from "./deleteTreeDirectly";
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
		if (force)
			return await deleteTreeDirectly(
				clone,
				worktreePath,
				`its work was discarded and git could not remove it: ${reason(error)}`,
			);
	}
	return await removeIgnoringLeftovers(clone, remove, worktreePath);
}

async function removeIgnoringLeftovers(
	clone: string,
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
			`worktree ${worktreePath} forced removal failed: ${reason(error)}`,
		);
		return await deleteStrandedTree(clone, worktreePath, error);
	}
}

function reason(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
