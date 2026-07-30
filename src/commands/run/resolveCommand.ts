import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export function resolveCommand(command: string): string {
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
