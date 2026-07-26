import { spawn } from "node:child_process";
import { daemonLog } from "../daemonLog";
import { resolveInstallCommand } from "./resolveInstallCommand";
import { trackInstall, untrackInstall } from "./stopInstall";
import { installInvocation } from "./installInvocation";

const STDERR_TAIL = 2000;

export function runInstall(
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
	daemonLog(`worktree ${worktreePath} installing deps: ${command}`);
	const child = spawn(...installInvocation(worktreePath, command));
	trackInstall(worktreePath, child);
	let stderr = "";
	child.stderr?.on("data", (chunk: Buffer) => {
		stderr = (stderr + chunk.toString()).slice(-STDERR_TAIL);
	});
	let settled = false;
	const settle = (outcome: string) => {
		if (settled) return;
		settled = true;
		untrackInstall(worktreePath, child);
		daemonLog(`worktree ${worktreePath} install ${outcome}`);
		onSeeded();
	};
	child.on("error", (error) => settle(`failed to start: ${error.message}`));
	child.on("close", (code, signal) =>
		settle(
			code === 0
				? "complete"
				: `failed (${signal ? `signal ${signal}` : `exit ${code}`}): ${stderr.trim() || "no output"}`,
		),
	);
}
