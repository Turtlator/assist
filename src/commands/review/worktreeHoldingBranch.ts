import { gitSyncOrNull } from "../sessions/daemon/worktree/git";

export function worktreeHoldingBranch(
	cwd: string,
	branch: string,
): string | null {
	const listing = gitSyncOrNull(cwd, ["worktree", "list", "--porcelain"]);
	if (!listing) return null;
	const here = gitSyncOrNull(cwd, ["rev-parse", "--show-toplevel"]);
	let path: string | null = null;
	for (const line of listing.split("\n")) {
		const trimmed = line.trim();
		if (trimmed.startsWith("worktree "))
			path = trimmed.slice("worktree ".length).trim();
		else if (trimmed === `branch refs/heads/${branch}`)
			return path && path !== here ? path : null;
	}
	return null;
}
