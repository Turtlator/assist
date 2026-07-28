import { gitFailureReason } from "./gitFailureReason";
import type { PullResult } from "./PullResult";
import { runGit } from "./resolveUpstream";

type GitAttempt = { ok: true } | { ok: false; reason: string };

type StashAttempt =
	| { ok: true; stashed: boolean }
	| { ok: false; reason: string };

const STASH_MESSAGE = "assist watch";

function attemptGit(args: string[], cwd?: string): GitAttempt {
	try {
		runGit(args, cwd);
		return { ok: true };
	} catch (error) {
		return { ok: false, reason: gitFailureReason(error) };
	}
}

function fastForwarded(cwd?: string): PullResult {
	return { kind: "fast-forwarded", sha: runGit(["rev-parse", "@"], cwd) };
}

function operationInProgress(cwd?: string): boolean {
	return ["MERGE_HEAD", "REBASE_HEAD"].some(
		(ref) => attemptGit(["rev-parse", "--verify", "--quiet", ref], cwd).ok,
	);
}

function headMatchesUpstream(cwd?: string): boolean {
	try {
		return (
			runGit(["rev-parse", "@"], cwd) === runGit(["rev-parse", "@{u}"], cwd)
		);
	} catch {
		return false;
	}
}

function behindUpstream(cwd?: string): boolean {
	return attemptGit(["merge-base", "--is-ancestor", "@", "@{u}"], cwd).ok;
}

function stashDirtyTree(cwd?: string): StashAttempt {
	let dirty: boolean;
	try {
		dirty = runGit(["status", "--porcelain"], cwd) !== "";
	} catch (error) {
		return { ok: false, reason: gitFailureReason(error) };
	}

	if (!dirty) return { ok: true, stashed: false };

	const push = attemptGit(
		["stash", "push", "--include-untracked", "--message", STASH_MESSAGE],
		cwd,
	);
	return push.ok ? { ok: true, stashed: true } : push;
}

function mergeBehindBranch(cwd?: string): PullResult {
	const stash = stashDirtyTree(cwd);
	if (!stash.ok) return { kind: "blocked", reason: stash.reason };

	const merge = attemptGit(["merge", "--ff-only", "@{u}"], cwd);
	const restore = stash.stashed
		? attemptGit(["stash", "pop"], cwd)
		: ({ ok: true } as GitAttempt);

	if (!merge.ok) return { kind: "blocked", reason: merge.reason };
	if (!restore.ok) return { kind: "blocked", reason: restore.reason };
	return fastForwarded(cwd);
}

export function pullFastForward(cwd?: string): PullResult {
	const pull = attemptGit(["pull", "--ff-only"], cwd);
	if (pull.ok) return fastForwarded(cwd);

	if (operationInProgress(cwd)) return { kind: "blocked", reason: pull.reason };
	if (headMatchesUpstream(cwd)) return fastForwarded(cwd);
	if (!behindUpstream(cwd)) return { kind: "blocked", reason: pull.reason };

	return mergeBehindBranch(cwd);
}
