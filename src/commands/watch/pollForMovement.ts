import { fetchQuietly } from "./fetchQuietly";
import { readMovement } from "./readMovement";
import type { WatchOutcome } from "./WatchOutcome";

type PollOptions = {
	upstream: string;
	intervalMs: number;
	timeoutMs: number | undefined;
	timeout: string;
	cwd?: string;
};

const MIN_FETCH_TIMEOUT_MS = 60_000;

export function pollForMovement(options: PollOptions): Promise<WatchOutcome> {
	const { upstream, intervalMs, timeoutMs, timeout, cwd } = options;
	const fetchTimeoutMs = Math.max(intervalMs, MIN_FETCH_TIMEOUT_MS);

	return new Promise<WatchOutcome>((resolve) => {
		let settled = false;

		const finish = (outcome: WatchOutcome): void => {
			if (settled) return;
			settled = true;
			clearInterval(ticker);
			clearTimeout(deadline);
			process.off("SIGINT", onInterrupt);
			resolve(outcome);
		};

		const onInterrupt = (): void => finish({ kind: "interrupted" });

		const ticker = setInterval(() => {
			fetchQuietly(cwd, fetchTimeoutMs);
			const found = readMovement(cwd);
			if (found) finish({ kind: "moved", upstream, ...found });
		}, intervalMs);

		const deadline =
			timeoutMs === undefined
				? undefined
				: setTimeout(
						() => finish({ kind: "timeout", upstream, timeout }),
						timeoutMs,
					);

		process.on("SIGINT", onInterrupt);
	});
}
