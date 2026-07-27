import { findRepoRoot } from "../../../../shared/findRepoRoot";
import { daemonLog } from "../daemonLog";
import { createWorktree } from "./createWorktree";
import { mainWorktree } from "./listWorktreePaths";
import { reusesClone } from "./reusesClone";
import { worktreeConfigFor } from "./worktreeConfigFor";

export type Allocation = {
	cwd: string | undefined;
	kind: "primary" | "worktree";
	created: boolean;
	clone?: string;
};

export type AllocateOptions = {
	forCheckout?: boolean;
	draftLike?: boolean;
	inPlace?: boolean;
};

export function allocateTree(
	requestedCwd: string | undefined,
	boundTreeRoots: Set<string>,
	options: AllocateOptions = {},
): Allocation {
	if (!requestedCwd)
		return { cwd: requestedCwd, kind: "primary", created: false };
	if (options.inPlace === true) return keptInPlace(requestedCwd);
	const repoRoot = findRepoRoot(requestedCwd) ?? requestedCwd;
	const cfg = worktreeConfigFor(repoRoot);
	if (!cfg.enabled)
		return { cwd: requestedCwd, kind: "primary", created: false };

	const clone = mainWorktree(repoRoot) ?? repoRoot;
	const reuse = { ...options, includeDrafts: cfg.includeDrafts };
	if (reusesClone(clone, boundTreeRoots, reuse))
		return { cwd: clone, kind: "primary", created: false, clone };

	const path = createWorktree(
		clone,
		{ root: cfg.root, trunk: cfg.trunk },
		boundTreeRoots,
	);
	return { cwd: path, kind: "worktree", created: true, clone };
}

function keptInPlace(cwd: string): Allocation {
	daemonLog(
		`session kept in ${cwd}: launched against work already checked out there`,
	);
	return { cwd, kind: "primary", created: false };
}
