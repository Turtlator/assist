import { gitFailureReason } from "./gitFailureReason";
import type { PullResult } from "./PullResult";
import { runGit } from "./resolveUpstream";

export function pullFastForward(cwd?: string): PullResult {
	try {
		runGit(["pull", "--ff-only"], cwd);
		return { kind: "fast-forwarded", sha: runGit(["rev-parse", "@"], cwd) };
	} catch (error) {
		return { kind: "blocked", reason: gitFailureReason(error) };
	}
}
