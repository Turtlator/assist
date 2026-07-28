import { parseDuration } from "./parseDuration";

type WatchDurations = { intervalMs: number; timeoutMs: number | undefined };

function parseOrExit(value: string): number {
	try {
		return parseDuration(value);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		return process.exit(1);
	}
}

export function parseWatchDurations(
	interval: string,
	timeout: string,
): WatchDurations {
	return {
		intervalMs: parseOrExit(interval),
		timeoutMs: timeout.trim() === "none" ? undefined : parseOrExit(timeout),
	};
}
