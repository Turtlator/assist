import { execGit } from "./execGit";
import { type GitStatusCounts, parseGitStatus } from "./parseGitStatus";

export async function workingTreeCounts(cwd: string): Promise<GitStatusCounts> {
	const output = await execGit(cwd, [
		"status",
		"--porcelain",
		"--untracked-files=all",
	]);
	return parseGitStatus(output);
}
