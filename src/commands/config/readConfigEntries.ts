import type { ConfigNode } from "../../shared/ConfigNode";
import {
	type ConfigLeaf,
	describeConfigLeaves,
} from "../../shared/describeConfigLeaves";
import { describeConfigNode } from "../../shared/describeConfigNode";
import { loadConfigFrom } from "../../shared/loadConfigFrom";
import { assistConfigSchema } from "../../shared/types";
import { getNestedValue } from "./getNestedValue";
import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";
import { readRawConfigLayers } from "./readRawConfigLayers";
import { type ConfigSource, resolveConfigSource } from "./resolveConfigSource";
import { configEntryNode } from "./configEntryNode";

export type ConfigEntry = ConfigLeaf & {
	value: unknown;
	source: ConfigSource;
	globalOnly?: boolean;
	node?: ConfigNode;
};

const KEYS_STRIPPED_FROM_MERGED_CONFIG = new Set(["repos"]);

export function readConfigEntries(cwd: string): ConfigEntry[] {
	const config = loadConfigFrom(cwd) as unknown as Record<string, unknown>;
	const layers = readRawConfigLayers(cwd);
	const schema = describeConfigNode(assistConfigSchema);
	return describeConfigLeaves(assistConfigSchema)
		.filter((leaf) => !KEYS_STRIPPED_FROM_MERGED_CONFIG.has(leaf.key))
		.map((leaf) => ({
			...leaf,
			value: getNestedValue(config, leaf.key),
			source: resolveConfigSource(leaf.key, layers),
			globalOnly: isGlobalOnlyConfigKey(leaf.key),
			node: configEntryNode(schema, leaf.key),
		}));
}
