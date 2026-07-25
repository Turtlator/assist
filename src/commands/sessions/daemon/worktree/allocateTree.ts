import { findRepoRoot } from "../../../../shared/findRepoRoot";
import { createWorktree } from "./createWorktree";
import { mainWorktree } from "./listWorktreePaths";
import { planAllocation } from "./planAllocation";
import { worktreeConfigFor } from "./worktreeConfigFor";

export type Allocation = {
	cwd: string | undefined;
	kind: "primary" | "worktree";
	created: boolean;
	clone?: string;
};

export function allocateTree(
	requestedCwd: string | undefined,
	boundTreeRoots: Set<string>,
): Allocation {
	if (!requestedCwd)
		return { cwd: requestedCwd, kind: "primary", created: false };
	const repoRoot = findRepoRoot(requestedCwd) ?? requestedCwd;
	const cfg = worktreeConfigFor(repoRoot);
	if (!cfg.enabled)
		return { cwd: requestedCwd, kind: "primary", created: false };

	const clone = mainWorktree(repoRoot) ?? repoRoot;
	if (planAllocation(clone, boundTreeRoots) === "primary")
		return { cwd: clone, kind: "primary", created: false, clone };

	const path = createWorktree(clone, cfg.root, boundTreeRoots);
	return { cwd: path, kind: "worktree", created: true, clone };
}
