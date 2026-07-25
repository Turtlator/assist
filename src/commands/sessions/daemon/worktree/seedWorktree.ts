import { execFile } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { daemonLog } from "../daemonLog";
import { resolveInstallCommand } from "./resolveInstallCommand";
import { worktreeConfigFor } from "./worktreeConfigFor";

export function seedWorktree(
	worktreePath: string,
	clone: string,
	onSeeded: () => void = () => {},
): void {
	const cfg = worktreeConfigFor(clone);
	copyConfigFiles(worktreePath, clone, cfg.copy);
	runInstall(worktreePath, clone, cfg.install, onSeeded);
}

function copyConfigFiles(
	worktreePath: string,
	clone: string,
	copy: string[],
): void {
	for (const rel of copy) {
		const src = join(clone, rel);
		if (!existsSync(src)) continue;
		const dest = join(worktreePath, rel);
		try {
			mkdirSync(dirname(dest), { recursive: true });
			copyFileSync(src, dest);
			daemonLog(`worktree ${worktreePath} seeded ${rel}`);
		} catch (error) {
			daemonLog(
				`worktree ${worktreePath} failed to seed ${rel}: ${message(error)}`,
			);
		}
	}
}

function runInstall(
	worktreePath: string,
	clone: string,
	install: boolean | string,
	onSeeded: () => void,
): void {
	const command = resolveInstallCommand(clone, install);
	if (!command) {
		onSeeded();
		return;
	}
	const windows = /^[A-Za-z]:[\\/]/.test(worktreePath);
	const shell = windows ? "cmd.exe" : (process.env.SHELL ?? "bash");
	const shellArgs = windows ? ["/c", command] : ["-l", "-c", command];
	daemonLog(`worktree ${worktreePath} installing deps: ${command}`);
	execFile(shell, shellArgs, { cwd: worktreePath }, (error) => {
		daemonLog(
			error
				? `worktree ${worktreePath} install failed: ${error.message}`
				: `worktree ${worktreePath} install complete`,
		);
		onSeeded();
	});
}

function message(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
