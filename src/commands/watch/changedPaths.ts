import { runGit } from "./resolveUpstream";

export function changedPaths(from: string, cwd?: string): string[] {
	return runGit(["diff", "--name-only", `${from}..HEAD`], cwd)
		.split("\n")
		.filter((line) => line.length > 0);
}
