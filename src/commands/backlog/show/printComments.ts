import chalk from "chalk";
import { formatComment } from "../formatComment";
import type { BacklogItem } from "../types";

export function printComments(item: BacklogItem): void {
	const entries = item.comments ?? [];
	if (entries.length === 0) return;

	console.log(chalk.bold("Comments"));
	for (const entry of entries) {
		console.log(`  ${formatComment(entry)}`);
	}
	console.log();
}
