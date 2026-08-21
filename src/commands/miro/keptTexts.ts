import chalk from "chalk";
import { applyIgnore } from "./applyIgnore";
import { readIgnoreList } from "./readIgnoreList";
import type { MiroExtractOptions, MiroItem } from "./types";
import { uniqueTexts } from "./uniqueTexts";

function warnUnmatched(file: string, unmatched: string[]): void {
	if (unmatched.length === 0) return;
	const entries = unmatched.map((entry) => `  - ${entry}`).join("\n");
	console.error(
		chalk.yellow(
			`${unmatched.length} ${unmatched.length === 1 ? "entry" : "entries"} in ${file} matched no box text:\n${entries}`,
		),
	);
}

export function keptTexts(
	options: MiroExtractOptions,
	boxes: MiroItem[],
): string[] {
	const ignore = options.ignore ? readIgnoreList(options.ignore) : [];
	const kept = applyIgnore(uniqueTexts(boxes), ignore);
	if (options.ignore) warnUnmatched(options.ignore, kept.unmatched);
	return kept.texts;
}
