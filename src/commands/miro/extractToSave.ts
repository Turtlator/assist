import type { MiroExtractConfig } from "../../shared/types";
import { storedExtractPath } from "./resolveExtractPath";
import type { MiroExtractOptions } from "./types";

type ExtractDetails = {
	options: MiroExtractOptions;
	items: string;
	topLeft: string;
	bottomRight: string;
	board?: string;
	frame?: string;
};

function defined<T extends object>(value: T): T {
	return Object.fromEntries(
		Object.entries(value).filter(([, field]) => field !== undefined),
	) as T;
}

export function extractToSave(
	details: ExtractDetails,
	cwd: string = process.cwd(),
): MiroExtractConfig {
	return defined({
		board: details.board,
		frame: details.frame,
		topLeft: details.topLeft,
		bottomRight: details.bottomRight,
		items: storedExtractPath(details.items, cwd),
		ignore: storedExtractPath(details.options.ignore, cwd),
		out: storedExtractPath(details.options.out, cwd),
	});
}
