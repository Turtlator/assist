import { daemonLog } from "./daemonLog";

/* why: each failed launch+connect spawns a fresh Windows daemon, so an
 * unreachable host gets a new daemon on every create — hundreds until killed.
 * After MAX_FAILURES consecutive failures the breaker trips for a backoff
 * window, capping retries at one launch per window. */
const MAX_FAILURES = 3;
const BACKOFF_MS = 60_000;

export class LaunchCircuitBreaker {
	private failures = 0;
	private until = 0;
	private lastCause = "";

	tripped(): boolean {
		return this.failures >= MAX_FAILURES && Date.now() < this.until;
	}

	reason(): string {
		const secs = Math.ceil((this.until - Date.now()) / 1000);
		const summary = `${this.failures} times in a row; not retrying for ${secs}s`;
		return this.lastCause
			? `${this.lastCause} (failed ${summary})`
			: `Windows daemon failed to start ${summary}`;
	}

	clear(): void {
		this.failures = 0;
		this.until = 0;
		this.lastCause = "";
	}

	fail(cause: string): void {
		this.failures++;
		this.lastCause = cause;
		if (this.failures < MAX_FAILURES) return;
		this.until = Date.now() + BACKOFF_MS;
		daemonLog(
			`windows connection: ${this.failures} consecutive launch failures; backing off ${BACKOFF_MS / 1000}s; last error: ${cause}`,
		);
	}
}
