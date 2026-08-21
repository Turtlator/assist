import { miroSource, type MiroSource } from "./miroSource";
import type { MiroExtractOptions, MiroRawItem } from "./types";

export function boardSource(
	raw: MiroRawItem[],
	anchorId: string,
	options: MiroExtractOptions,
): MiroSource {
	const derived = miroSource(raw, anchorId);
	return {
		board: options.board ?? derived.board,
		frame: options.frame ?? derived.frame,
	};
}
