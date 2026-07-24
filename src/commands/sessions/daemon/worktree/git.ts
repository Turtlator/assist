import { execFile, execFileSync } from "node:child_process";

function isWindowsPath(cwd: string): boolean {
	return /^[A-Za-z]:[\\/]/.test(cwd);
}

function gitInvocation(cwd: string, args: string[]) {
	const windows = isWindowsPath(cwd);
	return {
		file: windows ? "git.exe" : "git",
		argv: windows ? ["-C", cwd, ...args] : args,
		options: { encoding: "utf8" as const, ...(windows ? {} : { cwd }) },
	};
}

export function git(cwd: string, args: string[]): Promise<string> {
	const { file, argv, options } = gitInvocation(cwd, args);
	return new Promise((resolve, reject) => {
		execFile(file, argv, options, (error, stdout) => {
			if (error) reject(error);
			else resolve(stdout.toString());
		});
	});
}

export async function gitOrNull(
	cwd: string,
	args: string[],
): Promise<string | null> {
	try {
		return (await git(cwd, args)).trim() || null;
	} catch {
		return null;
	}
}

export function gitSync(cwd: string, args: string[]): string {
	const { file, argv, options } = gitInvocation(cwd, args);
	return execFileSync(file, argv, {
		...options,
		stdio: ["pipe", "pipe", "pipe"],
	}).toString();
}

export function gitSyncOrNull(cwd: string, args: string[]): string | null {
	try {
		return gitSync(cwd, args).trim() || null;
	} catch {
		return null;
	}
}

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
