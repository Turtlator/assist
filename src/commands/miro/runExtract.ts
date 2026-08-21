import { stringify } from "yaml";
import { MiroExtractError } from "./MiroExtractError";
import { normaliseItems } from "./normaliseItems";
import { parseAnchorId } from "./parseAnchorId";
import { readMiroItems } from "./readMiroItems";
import { selectBoxes } from "./selectBoxes";

type ExtractOptions = {
	items?: string;
	topLeft?: string;
	bottomRight?: string;
};

function requireItems(file: string | undefined): string {
	if (!file)
		throw new MiroExtractError(
			"--items <file> is required: a file of raw board_list_items response pages.",
		);
	return file;
}

function requireAnchors(options: ExtractOptions): [string, string] {
	if (!options.topLeft || !options.bottomRight)
		throw new MiroExtractError(
			"Both --top-left <id|link> and --bottom-right <id|link> are required.",
		);
	return [parseAnchorId(options.topLeft), parseAnchorId(options.bottomRight)];
}

export function runExtract(options: ExtractOptions): void {
	const [topLeft, bottomRight] = requireAnchors(options);
	const items = normaliseItems(readMiroItems(requireItems(options.items)));
	const boxes = selectBoxes(items, topLeft, bottomRight);
	process.stdout.write(stringify(boxes.map((box) => box.text)));
}
