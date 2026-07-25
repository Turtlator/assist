import { getNestedValue } from "./getNestedValue";
import type { RawConfigLayers } from "./readRawConfigLayers";

export type ConfigSource = "project" | "global" | "default";

export function resolveConfigSource(
	key: string,
	layers: RawConfigLayers,
): ConfigSource {
	if (getNestedValue(layers.project, key) !== undefined) return "project";
	if (getNestedValue(layers.repoOverride, key) !== undefined) return "global";
	if (getNestedValue(layers.global, key) !== undefined) return "global";
	return "default";
}
