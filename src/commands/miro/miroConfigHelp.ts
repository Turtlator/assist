import type { ConfigHelpEntry } from "../../shared/configHelp";

export const miroConfigHelp: ConfigHelpEntry[] = [
	{
		key: "miro.extracts",
		setter: "assist miro extract --save <name>",
		note: "named box selections (board, frame, anchors, items, ignore, out) replayed by miro extract <name>",
	},
];
