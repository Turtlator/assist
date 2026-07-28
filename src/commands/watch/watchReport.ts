import { buildWatchReport } from "./buildWatchReport";
import { gitFailureReason } from "./gitFailureReason";

export function watchReport(options: { from?: string }): void {
	try {
		console.log(buildWatchReport(options.from));
	} catch (error) {
		console.error(`cannot build the report: ${gitFailureReason(error)}`);
		process.exit(1);
	}
}
