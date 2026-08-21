import { changedPaths } from "./changedPaths";
import { readBuiltVersion } from "./readBuiltVersion";
import { readRecentCommits } from "./readRecentCommits";
import { renderWatchReport } from "./renderWatchReport";
import { runGit } from "./resolveUpstream";
import { restartAdvice } from "./restartAdvice";
import { syncAdvice } from "./syncAdvice";

const lines = (output: string): string[] =>
	output.split("\n").filter((line) => line.length > 0);

export function buildWatchReport(from?: string, cwd?: string): string {
	const changed = from ? changedPaths(from, cwd) : [];

	return renderWatchReport({
		version: readBuiltVersion(cwd),
		commits: readRecentCommits(10, cwd),
		newShas: from ? lines(runGit(["rev-list", `${from}..HEAD`], cwd)) : [],
		restarts: restartAdvice(changed),
		syncs: syncAdvice(changed),
	});
}
