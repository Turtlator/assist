import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { expandEnv } from "../../shared/expandEnv";
import type { RunCommandResult } from "./RunCommandResult";
import { resolveCommand } from "./resolveCommand";

export function runCommandToCompletion(
	command: string,
	args: string[],
	env?: Record<string, string>,
	cwd?: string,
	quiet?: boolean,
): Promise<RunCommandResult> {
	return new Promise((resolveResult) => {
		if (cwd && !existsSync(cwd)) {
			resolveResult({
				kind: "failed",
				message: `Failed to execute command: cwd ${cwd} does not exist`,
			});
			return;
		}
		const child = spawn(resolveCommand(command), args, {
			stdio: quiet ? "pipe" : "inherit",
			env: env ? { ...process.env, ...expandEnv(env) } : undefined,
			cwd,
		});
		const chunks: Buffer[] = [];
		if (quiet) {
			child.stdout?.on("data", (data: Buffer) => chunks.push(data));
			child.stderr?.on("data", (data: Buffer) => chunks.push(data));
		}
		child.on("close", (code) => {
			resolveResult({
				kind: "completed",
				exitCode: code ?? 0,
				output: Buffer.concat(chunks).toString(),
			});
		});
		child.on("error", (err) => {
			resolveResult({
				kind: "failed",
				message: `Failed to execute command: ${err.message}`,
			});
		});
	});
}
