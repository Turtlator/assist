import chalk from "chalk";
import { stringify } from "yaml";
import { anchorSource } from "./anchorSource";
import { applyIgnore } from "./applyIgnore";
import { MiroExtractError } from "./MiroExtractError";
import { miroSource } from "./miroSource";
import { normaliseItems } from "./normaliseItems";
import { pickAnchors } from "./pickAnchors";
import { readIgnoreList } from "./readIgnoreList";
import { readMiroItems } from "./readMiroItems";
import { selectBoxes } from "./selectBoxes";
import type { MiroExtractOptions } from "./types";
import { uniqueTexts } from "./uniqueTexts";
import { writeExtract } from "./writeExtract";

function requireItems(file: string | undefined): string {
	if (!file)
		throw new MiroExtractError(
			"--items <file> is required: a file of raw board_list_items response pages.",
		);
	return file;
}

function warnUnmatched(file: string, unmatched: string[]): void {
	if (unmatched.length === 0) return;
	const entries = unmatched.map((entry) => `  - ${entry}`).join("\n");
	console.error(
		chalk.yellow(
			`${unmatched.length} ${unmatched.length === 1 ? "entry" : "entries"} in ${file} matched no box text:\n${entries}`,
		),
	);
}

export async function runExtract(options: MiroExtractOptions): Promise<void> {
	const source = anchorSource(options);
	const raw = readMiroItems(requireItems(options.items));
	const items = normaliseItems(raw);
	const [topLeft, bottomRight] = source.pick
		? await pickAnchors(source.sessionId, items)
		: [source.topLeft, source.bottomRight];
	const selection = selectBoxes(items, topLeft, bottomRight);
	const ignore = options.ignore ? readIgnoreList(options.ignore) : [];
	const kept = applyIgnore(uniqueTexts(selection.boxes), ignore);
	if (options.ignore) warnUnmatched(options.ignore, kept.unmatched);
	if (!options.out) {
		process.stdout.write(stringify(kept.texts));
		return;
	}
	writeExtract(
		options.out,
		{ ...miroSource(raw, topLeft), topLeft, bottomRight, rect: selection.rect },
		kept.texts,
	);
	console.log(
		`Wrote ${kept.texts.length} ${kept.texts.length === 1 ? "box" : "boxes"} to ${options.out}`,
	);
}
