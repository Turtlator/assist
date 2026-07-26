import { execFileSync } from "node:child_process";

export function fetchQuietly(cwd: string | undefined, timeoutMs: number): void {
	try {
		execFileSync("git", ["fetch", "--quiet"], {
			stdio: ["pipe", "pipe", "pipe"],
			cwd,
			timeout: timeoutMs,
		});
	} catch {}
}
