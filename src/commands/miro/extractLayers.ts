import { projectConfigPathFrom } from "../../shared/loadConfigFrom";
import { getNestedValue } from "../config/getNestedValue";
import { globalConfigFileLabel } from "../config/globalConfigFileLabel";
import type { RawConfigLayers } from "../config/readRawConfigLayers";

type ExtractLayer = { file: string; extracts: Record<string, unknown> };

function extractsIn(layer: Record<string, unknown>): Record<string, unknown> {
	const value = getNestedValue(layer, "miro.extracts");
	return value !== null && typeof value === "object" && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};
}

export function extractLayers(
	layers: RawConfigLayers,
	cwd: string,
	globalConfigPath: string,
): ExtractLayer[] {
	const globalFile = globalConfigFileLabel(globalConfigPath);
	return [
		{ file: projectConfigPathFrom(cwd), extracts: extractsIn(layers.project) },
		{
			file: `${globalFile} under repos.${layers.repoKey}`,
			extracts: extractsIn(layers.repoOverride),
		},
		{ file: globalFile, extracts: extractsIn(layers.global) },
	];
}

export function unknownExtract(name: string, layers: ExtractLayer[]): string {
	const names = [
		...new Set(layers.flatMap((layer) => Object.keys(layer.extracts))),
	].sort();
	if (names.length === 0)
		return `No extract named "${name}" is configured. Pick a rectangle with no anchor flags, then save it as "${name}".`;
	return `No extract named "${name}" is configured. Configured extracts: ${names.join(", ")}.`;
}
