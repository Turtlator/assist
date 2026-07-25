import { gitSyncOrNull } from "./git";

type StartPoint = { ref: string; track: boolean };

export function worktreeStartPoint(clone: string, trunk: boolean): StartPoint {
	const branch = trunk ? cloneTrunkBranch(clone) : remoteDefaultBranch(clone);
	const ref = `origin/${branch}`;
	if (gitSyncOrNull(clone, ["rev-parse", "--verify", "--quiet", ref]))
		return { ref, track: trunk };
	return { ref: "HEAD", track: false };
}

function cloneTrunkBranch(clone: string): string {
	return cloneHead(clone) ?? remoteDefaultBranch(clone);
}

function remoteDefaultBranch(clone: string): string {
	const head = gitSyncOrNull(clone, [
		"symbolic-ref",
		"--short",
		"refs/remotes/origin/HEAD",
	]);
	if (!head) return cloneHead(clone) ?? "main";
	const slash = head.indexOf("/");
	return slash === -1 ? head : head.slice(slash + 1);
}

function cloneHead(clone: string): string | null {
	return gitSyncOrNull(clone, ["symbolic-ref", "--short", "HEAD"]);
}
