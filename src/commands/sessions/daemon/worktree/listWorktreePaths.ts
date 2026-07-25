import { gitSyncOrNull } from "./git";

export function listWorktreePaths(cwd: string): string[] {
	const out = gitSyncOrNull(cwd, ["worktree", "list", "--porcelain"]);
	if (!out) return [];
	return out
		.split("\n")
		.filter((line) => line.startsWith("worktree "))
		.map((line) => line.slice("worktree ".length).trim());
}

export function mainWorktree(cwd: string): string | null {
	return listWorktreePaths(cwd)[0] ?? null;
}

export function listLocalBranches(cwd: string): string[] {
	const out = gitSyncOrNull(cwd, [
		"for-each-ref",
		"--format=%(refname:short)",
		"refs/heads",
	]);
	return out ? out.split("\n").map((line) => line.trim()) : [];
}

export function gitCommonDir(cwd: string): string | null {
	return gitSyncOrNull(cwd, [
		"rev-parse",
		"--path-format=absolute",
		"--git-common-dir",
	]);
}
