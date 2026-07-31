import chalk from "chalk";
import type { ParsedFinding } from "./parseFindings";

export function warnUnlocated(unlocated: ParsedFinding[]): void {
	if (unlocated.length === 0) return;
	console.warn(
		chalk.yellow(
			`Moved ${unlocated.length} finding(s) without a parseable file:line into the review body:`,
		),
	);
	for (const finding of unlocated) {
		const where = finding.location || chalk.dim("missing");
		console.warn(
			`  ${chalk.yellow("·")} ${finding.title} ${chalk.dim(`(${where})`)}`,
		);
	}
}
