import type { RepoGroup } from "../shared/RepoGroup";
import { isWindowsCwd } from "./isWindowsCwd";
import { originForCwd } from "./originForCwd";
import { mainWorktree } from "./worktree/listWorktreePaths";
import { worktreeAttributionIncludingReaped } from "./worktree/readWorktreeRegistry";

const cache = new Map<string, RepoGroup | undefined>();

export function repoGroupForCwd(
	cwd: string | undefined,
): RepoGroup | undefined {
	if (!cwd) return undefined;
	if (cache.has(cwd)) return cache.get(cwd);
	const group = resolveRepoGroup(cwd);
	cache.set(cwd, group);
	return group;
}

function resolveRepoGroup(cwd: string): RepoGroup | undefined {
	const live = groupFromLiveTree(cwd);
	if (live) return live;
	const reaped = worktreeAttributionIncludingReaped(cwd);
	return reaped && hostedGroup(cwd, reaped.origin, reaped.clone);
}

function groupFromLiveTree(cwd: string): RepoGroup | undefined {
	const clone = mainWorktree(cwd);
	const origin = clone ? originForCwd(clone) : undefined;
	return clone && origin ? hostedGroup(cwd, origin, clone) : undefined;
}

function hostedGroup(cwd: string, origin: string, clone: string): RepoGroup {
	return { origin: isWindowsCwd(cwd) ? `windows:${origin}` : origin, clone };
}
