import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { stripAnsi } from "../../shared/stripAnsi";

const LOG_FILE = "review.log";

type ReviewLogSink = {
	append(line: string): void;
	attach(reviewDir: string): void;
};

export function createReviewLogSink(): ReviewLogSink {
	let logPath: string | undefined;
	let buffered: string[] = [];
	return {
		append(line: string): void {
			const stripped = stripAnsi(line);
			if (!logPath) {
				buffered.push(stripped);
				return;
			}
			appendFileSync(logPath, `${stripped}\n`);
		},
		attach(reviewDir: string): void {
			mkdirSync(reviewDir, { recursive: true });
			logPath = join(reviewDir, LOG_FILE);
			const lines = [
				"",
				`=== ${new Date().toISOString()} ===`,
				`$ ${process.argv.slice(1).join(" ")}`,
				...buffered,
			];
			buffered = [];
			appendFileSync(logPath, `${lines.join("\n")}\n`);
		},
	};
}
