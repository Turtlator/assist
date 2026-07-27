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
	commits?: boolean;
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
	if (mustLeaveTrunk(cfg.trunk, options))
		daemonLog(
			`committing session spilled out of the clone ${clone}: worktree.trunk is on, so a commit here would land on the local mainline`,
		);
	else if (reusesClone(clone, boundTreeRoots, reuse))
		return { cwd: clone, kind: "primary", created: false, clone };

	const path = createWorktree(
		clone,
		{ root: cfg.root, trunk: cfg.trunk },
		boundTreeRoots,
	);
	return { cwd: path, kind: "worktree", created: true, clone };
}

function mustLeaveTrunk(trunk: boolean, options: AllocateOptions): boolean {
	return trunk === true && options.commits === true;
}

function keptInPlace(cwd: string): Allocation {
	daemonLog(
		`session kept in ${cwd}: launched against work already checked out there`,
	);
	return { cwd, kind: "primary", created: false };
}
