import type { CommitEntry } from "./CommitEntry";
import { runGit } from "./resolveUpstream";

export function readRecentCommits(count = 10, cwd?: string): CommitEntry[] {
	const output = runGit(
		["log", `-${count}`, "--pretty=format:%H%x09%h%x09%ar%x09%s"],
		cwd,
	);

	if (!output) return [];

	return output.split("\n").map((line) => {
		const [sha, short, when, ...subject] = line.split("\t");
		return { sha, short, when, subject: subject.join("\t") };
	});
}
