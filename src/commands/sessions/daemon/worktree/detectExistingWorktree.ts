import { findRepoRoot } from "../../../../shared/findRepoRoot";
import { mainWorktree } from "./listWorktreePaths";
import { worktreeConfigFor } from "./worktreeConfigFor";

export function detectExistingWorktree(
	cwd: string,
): { path: string; clone: string } | undefined {
	const repoRoot = findRepoRoot(cwd) ?? cwd;
	if (!worktreeConfigFor(repoRoot).enabled) return undefined;
	const clone = mainWorktree(repoRoot);
	if (clone && clone !== repoRoot) return { path: repoRoot, clone };
	return undefined;
}
