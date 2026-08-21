import { stringify } from "yaml";
import { MiroExtractError } from "./MiroExtractError";
import { normaliseItems } from "./normaliseItems";
import { parseAnchorId } from "./parseAnchorId";
import { pickAnchors } from "./pickAnchors";
import { readMiroItems } from "./readMiroItems";
import { selectBoxes } from "./selectBoxes";

type ExtractOptions = {
	items?: string;
	topLeft?: string;
	bottomRight?: string;
};

type AnchorSource =
	| { pick: false; topLeft: string; bottomRight: string }
	| { pick: true; sessionId: string };

function requireItems(file: string | undefined): string {
	if (!file)
		throw new MiroExtractError(
			"--items <file> is required: a file of raw board_list_items response pages.",
		);
	return file;
}

function anchorSource(options: ExtractOptions): AnchorSource {
	if (options.topLeft && options.bottomRight)
		return {
			pick: false,
			topLeft: parseAnchorId(options.topLeft),
			bottomRight: parseAnchorId(options.bottomRight),
		};
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId)
		throw new MiroExtractError(
			"Both --top-left <id|link> and --bottom-right <id|link> are required: there is no assist session to host the picker pane.",
		);
	return { pick: true, sessionId };
}

export async function runExtract(options: ExtractOptions): Promise<void> {
	const source = anchorSource(options);
	const items = normaliseItems(readMiroItems(requireItems(options.items)));
	const [topLeft, bottomRight] = source.pick
		? await pickAnchors(source.sessionId, items)
		: [source.topLeft, source.bottomRight];
	const boxes = selectBoxes(items, topLeft, bottomRight);
	process.stdout.write(stringify(boxes.map((box) => box.text)));
}
