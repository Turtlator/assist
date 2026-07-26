import { fetchQuietly } from "./fetchQuietly";
import { readMovement } from "./readMovement";
import { resolveUpstream } from "./resolveUpstream";
import type { WatchOutcome } from "./WatchOutcome";

type WaitOptions = {
	intervalMs: number;
	timeoutMs: number;
	timeout: string;
	cwd?: string;
	onStart?: (upstream: string) => void;
};

const MIN_FETCH_TIMEOUT_MS = 60_000;

export function waitForUpstream(options: WaitOptions): Promise<WatchOutcome> {
	const { intervalMs, timeoutMs, timeout, cwd, onStart } = options;

	let upstream: string;
	try {
		upstream = resolveUpstream(cwd).upstream;
	} catch (error) {
		return Promise.resolve({
			kind: "unavailable",
			reason: error instanceof Error ? error.message : String(error),
		});
	}

	onStart?.(upstream);

	const moved = readMovement(cwd);
	if (moved) {
		return Promise.resolve({ kind: "moved", upstream, ...moved });
	}

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

		const deadline = setTimeout(
			() => finish({ kind: "timeout", upstream, timeout }),
			timeoutMs,
		);

		process.on("SIGINT", onInterrupt);
	});
}
