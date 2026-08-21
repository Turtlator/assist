import { MiroExtractError } from "./MiroExtractError";
import { parseAnchorId } from "./parseAnchorId";
import type { MiroExtractOptions } from "./types";

type AnchorSource =
	| { pick: false; topLeft: string; bottomRight: string }
	| { pick: true; sessionId: string };

export function anchorSource(options: MiroExtractOptions): AnchorSource {
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
