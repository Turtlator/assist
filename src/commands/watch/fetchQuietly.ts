import { execFileSync } from "node:child_process";

const MIN_FETCH_TIMEOUT_MS = 60_000;

export function fetchQuietly(
	cwd: string | undefined,
	intervalMs: number,
): void {
	try {
		execFileSync("git", ["fetch", "--quiet"], {
			stdio: ["pipe", "pipe", "pipe"],
			cwd,
			timeout: Math.max(intervalMs, MIN_FETCH_TIMEOUT_MS),
		});
	} catch {}
}
