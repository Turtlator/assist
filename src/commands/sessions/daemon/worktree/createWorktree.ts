import { existsSync } from "node:fs";
import { basename, dirname } from "node:path";
import { expandTilde } from "../../../../shared/expandTilde";
import { getCurrentOrigin } from "../../../backlog/getCurrentOrigin";
import { daemonLog } from "../daemonLog";
import { gitSync, gitSyncOrNull } from "./git";
import { listLocalBranches, listWorktreePaths } from "./listWorktreePaths";
import { nextWorktreePath } from "./planAllocation";
import { recordWorktree } from "./readWorktreeRegistry";

export function createWorktree(
	clone: string,
	root: string | undefined,
	boundTreeRoots: Set<string>,
): string {
	const base = root ? expandTilde(root) : dirname(clone);
	const registered = new Set(listWorktreePaths(clone));
	const branches = new Set(listLocalBranches(clone));
	const path = nextWorktreePath(
		clone,
		base,
		(candidate) =>
			registered.has(candidate) ||
			existsSync(candidate) ||
			boundTreeRoots.has(candidate) ||
			branches.has(basename(candidate)),
	);
	const trunk = cloneTrunkBranch(clone);
	gitSync(clone, ["config", "push.default", "upstream"]);
	gitSync(clone, [
		"worktree",
		"add",
		"--track",
		"-b",
		basename(path),
		path,
		`origin/${trunk}`,
	]);
	recordWorktree(path, clone, getCurrentOrigin(clone));
	daemonLog(
		`worktree allocated ${path} (branch ${basename(path)} tracking origin/${trunk}) for clone ${clone}`,
	);
	return path;
}

function cloneTrunkBranch(clone: string): string {
	const branch = gitSyncOrNull(clone, ["symbolic-ref", "--short", "HEAD"]);
	if (branch) return branch;
	const head = gitSyncOrNull(clone, [
		"symbolic-ref",
		"--short",
		"refs/remotes/origin/HEAD",
	]);
	if (head) {
		const slash = head.indexOf("/");
		return slash === -1 ? head : head.slice(slash + 1);
	}
	return "main";
}
