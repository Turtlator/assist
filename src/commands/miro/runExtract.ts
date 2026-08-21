import { anchorSource } from "./anchorSource";
import { boardSource } from "./boardSource";
import { emitExtract } from "./emitExtract";
import { extractToSave } from "./extractToSave";
import { keptTexts } from "./keptTexts";
import { MiroExtractError } from "./MiroExtractError";
import { normaliseItems } from "./normaliseItems";
import { offerSaveExtract } from "./offerSaveExtract";
import { pickAnchors } from "./pickAnchors";
import { readMiroItems } from "./readMiroItems";
import { resolveExtractOptions } from "./resolveExtractOptions";
import { selectBoxes } from "./selectBoxes";
import type { MiroExtractOptions, MiroExtractPaths } from "./types";

function requireItems(file: string | undefined): string {
	if (!file)
		throw new MiroExtractError(
			"--items <file> is required: a file of raw board_list_items response pages.",
		);
	return file;
}

export async function runExtract(
	name: string | undefined,
	options: MiroExtractOptions,
	paths: MiroExtractPaths = {},
): Promise<void> {
	const resolved = resolveExtractOptions(name, options, paths);
	const source = anchorSource(resolved);
	const itemsFile = requireItems(resolved.items);
	const raw = readMiroItems(itemsFile);
	const items = normaliseItems(raw);
	const [topLeft, bottomRight] = source.pick
		? await pickAnchors(source.sessionId, items)
		: [source.topLeft, source.bottomRight];
	const selection = selectBoxes(items, topLeft, bottomRight);
	const board = boardSource(raw, topLeft, resolved);
	emitExtract(
		resolved.out,
		{ ...board, topLeft, bottomRight, rect: selection.rect },
		keptTexts(resolved, selection.boxes),
	);
	if (source.pick || resolved.save)
		await offerSaveExtract(
			extractToSave(
				{ options: resolved, items: itemsFile, topLeft, bottomRight, ...board },
				paths.cwd,
			),
			resolved,
			paths,
		);
}
