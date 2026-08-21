import { getGlobalConfigPath } from "../../shared/loadConfigFrom";
import { readRawConfigLayers } from "../config/readRawConfigLayers";
import { extractLayers, unknownExtract } from "./extractLayers";
import { mergeExtractOptions } from "./mergeExtractOptions";
import { MiroExtractError } from "./MiroExtractError";
import { parseExtract } from "./parseExtract";
import type { MiroExtractOptions } from "./types";

type ResolvedMiroExtract = { options: MiroExtractOptions; from: string };

export function resolveMiroExtract(
	name: string,
	options: MiroExtractOptions,
	cwd: string = process.cwd(),
	globalConfigPath: string = getGlobalConfigPath(),
): ResolvedMiroExtract {
	const byPrecedence = extractLayers(
		readRawConfigLayers(cwd, globalConfigPath),
		cwd,
		globalConfigPath,
	);
	const found = byPrecedence.filter((layer) => name in layer.extracts);
	if (found.length === 0)
		throw new MiroExtractError(unknownExtract(name, byPrecedence));
	const merged = Object.assign(
		{},
		...[...found].reverse().map((layer) => layer.extracts[name]),
	);
	return {
		options: mergeExtractOptions(options, parseExtract(name, merged), cwd),
		from: found.map((layer) => layer.file).join(" merged with "),
	};
}
