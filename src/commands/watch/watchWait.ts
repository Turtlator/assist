import { buildWatchReport } from "./buildWatchReport";
import { changedPaths } from "./changedPaths";
import { describeOutcome } from "./describeOutcome";
import { describePull } from "./describePull";
import type { OutcomeReport } from "./OutcomeReport";
import { parseWatchDurations } from "./parseWatchDurations";
import { pullFastForward } from "./pullFastForward";
import { reportBuildOrExit } from "./reportBuildOrExit";
import { reportSyncOrExit } from "./reportSyncOrExit";
import { syncAdvice } from "./syncAdvice";
import { waitForUpstream } from "./waitForUpstream";

type WatchWaitOptions = {
	interval: string;
	timeout: string;
	pull?: boolean;
	build?: boolean | string;
};

const DEFAULT_BUILD_ENTRY = "auto-build";

function report({ exitCode, message }: OutcomeReport): void {
	if (exitCode === 0) console.log(message);
	else console.error(message);
}

export async function watchWait(options: WatchWaitOptions): Promise<void> {
	const { intervalMs, timeoutMs } = parseWatchDurations(
		options.interval,
		options.timeout,
	);

	const outcome = await waitForUpstream({
		intervalMs,
		timeoutMs,
		timeout: options.timeout,
		onStart: (upstream) => console.log(`waiting on ${upstream} …`),
	});

	const waitReport = describeOutcome(outcome);
	report(waitReport);

	if (outcome.kind !== "moved" || !options.pull)
		return process.exit(waitReport.exitCode);

	const pullResult = pullFastForward();
	const pullReport = describePull(pullResult);
	report(pullReport);

	if (pullResult.kind !== "fast-forwarded")
		return process.exit(pullReport.exitCode);

	console.log(`\n${buildWatchReport(outcome.from)}`);

	if (options.build) {
		await reportBuildOrExit(
			typeof options.build === "string" ? options.build : DEFAULT_BUILD_ENTRY,
		);

		if (syncAdvice(changedPaths(outcome.from)).length > 0)
			await reportSyncOrExit();
	}

	process.exit(0);
}
