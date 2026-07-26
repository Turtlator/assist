import { existsSync } from "node:fs";
import { join } from "node:path";
import { daemonLog } from "../daemonLog";
import { deleteTreeDirectly } from "./deleteTreeDirectly";

export async function deleteStrandedTree(
	clone: string,
	worktreePath: string,
	cause: unknown,
): Promise<boolean> {
	const stranded = strandedReason(worktreePath, cause);
	if (!stranded) {
		daemonLog(
			`worktree ${worktreePath} left in place for the next reconcile: ${reason(cause)}`,
		);
		return false;
	}
	return await deleteTreeDirectly(
		clone,
		worktreePath,
		`git can no longer remove it, ${stranded}`,
	);
}

function strandedReason(worktreePath: string, cause: unknown): string | null {
	if (!existsSync(join(worktreePath, ".git")))
		return "its .git link is already gone";
	if (/not a working tree|not a git repository/i.test(reason(cause)))
		return "git no longer recognises it as a working tree";
	return null;
}

function reason(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
