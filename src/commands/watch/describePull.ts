import type { OutcomeReport } from "./OutcomeReport";
import type { PullResult } from "./PullResult";

export function describePull(result: PullResult): OutcomeReport {
	if (result.kind === "fast-forwarded") {
		return {
			exitCode: 0,
			message: `pulled --ff-only → ${result.sha.slice(0, 7)}`,
		};
	}

	return {
		exitCode: 3,
		message: `pull was not a fast-forward:\n${result.reason}`,
	};
}
