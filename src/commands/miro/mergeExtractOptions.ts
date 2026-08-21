import type { MiroExtractConfig } from "../../shared/types";
import { resolveExtractPath } from "./resolveExtractPath";
import type { MiroExtractOptions } from "./types";

export function mergeExtractOptions(
	options: MiroExtractOptions,
	extract: MiroExtractConfig,
	cwd: string,
): MiroExtractOptions {
	return {
		...options,
		board: options.board ?? extract.board,
		frame: options.frame ?? extract.frame,
		topLeft: options.topLeft ?? extract.topLeft,
		bottomRight: options.bottomRight ?? extract.bottomRight,
		items: options.items ?? resolveExtractPath(extract.items, cwd),
		ignore: options.ignore ?? resolveExtractPath(extract.ignore, cwd),
		out: options.out ?? resolveExtractPath(extract.out, cwd),
	};
}
