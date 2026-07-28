import { execFile, execFileSync } from "node:child_process";

function isWindowsPath(cwd: string): boolean {
	return /^[A-Za-z]:[\\/]/.test(cwd);
}

function gitInvocation(cwd: string, args: string[]) {
	const windows = isWindowsPath(cwd);
	return {
		file: windows ? "git.exe" : "git",
		argv: windows ? ["-C", cwd, ...args] : args,
		options: {
			encoding: "utf8" as const,
			windowsHide: true,
			...(windows ? {} : { cwd }),
		},
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

export type GitResult =
	| { ok: true; out: string }
	| { ok: false; error: string };

export async function gitResult(
	cwd: string,
	args: string[],
): Promise<GitResult> {
	try {
		return { ok: true, out: (await git(cwd, args)).trim() };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

export function gitSyncResult(cwd: string, args: string[]): GitResult {
	try {
		return { ok: true, out: gitSync(cwd, args).trim() };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error),
		};
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
