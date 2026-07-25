import { findRepoRoot } from "../../../../shared/findRepoRoot";
import { daemonLog } from "../daemonLog";
import { createWorktree } from "./createWorktree";
import { mainWorktree } from "./listWorktreePaths";
import { planAllocation } from "./planAllocation";
import { checkDurabilitySync } from "./treeDurability";
import { worktreeConfigFor } from "./worktreeConfigFor";

export type Allocation = {
	cwd: string | undefined;
	kind: "primary" | "worktree";
	created: boolean;
	clone?: string;
};

export type AllocateOptions = {
	forCheckout?: boolean;
};

export function allocateTree(
	requestedCwd: string | undefined,
	boundTreeRoots: Set<string>,
	options: AllocateOptions = {},
): Allocation {
	if (!requestedCwd)
		return { cwd: requestedCwd, kind: "primary", created: false };
	const repoRoot = findRepoRoot(requestedCwd) ?? requestedCwd;
	const cfg = worktreeConfigFor(repoRoot);
	if (!cfg.enabled)
		return { cwd: requestedCwd, kind: "primary", created: false };

	const clone = mainWorktree(repoRoot) ?? repoRoot;
	if (
		planAllocation(clone, boundTreeRoots) === "primary" &&
		!wouldDisturbWorkInProgress(clone, options.forCheckout === true)
	)
		return { cwd: clone, kind: "primary", created: false, clone };

	const path = createWorktree(
		clone,
		{ root: cfg.root, trunk: cfg.trunk },
		boundTreeRoots,
	);
	return { cwd: path, kind: "worktree", created: true, clone };
}

function wouldDisturbWorkInProgress(
	clone: string,
	forCheckout: boolean,
): boolean {
	if (!forCheckout) return false;
	const durability = checkDurabilitySync(clone);
	if (durability.durable) return false;
	daemonLog(
		`tree ${clone} not used for a PR checkout: ${durability.reason} — spilling to a worktree`,
	);
	return true;
}
