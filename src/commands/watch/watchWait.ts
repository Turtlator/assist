import { describeOutcome } from "./describeOutcome";
import { describePull } from "./describePull";
import type { OutcomeReport } from "./OutcomeReport";
import { parseDuration } from "./parseDuration";
import { pullFastForward } from "./pullFastForward";
import { waitForUpstream } from "./waitForUpstream";

type WatchWaitOptions = { interval: string; timeout: string; pull?: boolean };

function parseOrExit(value: string): number {
	try {
		return parseDuration(value);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		return process.exit(1);
	}
}

function report({ exitCode, message }: OutcomeReport): void {
	if (exitCode === 0) console.log(message);
	else console.error(message);
}

export async function watchWait(options: WatchWaitOptions): Promise<void> {
	const intervalMs = parseOrExit(options.interval);
	const timeoutMs = parseOrExit(options.timeout);

	const outcome = await waitForUpstream({
		intervalMs,
		timeoutMs,
		timeout: options.timeout,
		onStart: (upstream) => console.log(`waiting on ${upstream} …`),
	});

	const waitReport = describeOutcome(outcome);
	report(waitReport);

	if (outcome.kind === "moved" && options.pull) {
		const pullReport = describePull(pullFastForward());
		report(pullReport);
		process.exit(pullReport.exitCode);
	}

	process.exit(waitReport.exitCode);
}
