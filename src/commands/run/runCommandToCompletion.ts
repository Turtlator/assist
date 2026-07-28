import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { expandEnv } from "../../shared/expandEnv";
import type { RunCommandResult } from "./RunCommandResult";

function resolveCommand(command: string): string {
	if (process.platform !== "win32" || command !== "bash") return command;
	try {
		const gitPath = execFileSync("where", ["git"], { encoding: "utf8" })
			.trim()
			.split("\r\n")[0];
		const gitRoot = resolve(dirname(gitPath), "..");
		const gitBash = join(gitRoot, "bin", "bash.exe");
		if (existsSync(gitBash)) return gitBash;
	} catch {
		return command;
	}
	return command;
}

export function runCommandToCompletion(
	command: string,
	args: string[],
	env?: Record<string, string>,
	cwd?: string,
	quiet?: boolean,
): Promise<RunCommandResult> {
	return new Promise((resolveResult) => {
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
