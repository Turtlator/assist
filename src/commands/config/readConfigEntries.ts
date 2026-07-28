import type { ConfigNode } from "../../shared/ConfigNode";
import {
	type ConfigLeaf,
	describeConfigLeaves,
} from "../../shared/describeConfigLeaves";
import { describeConfigNode } from "../../shared/describeConfigNode";
import { loadConfigFrom } from "../../shared/loadConfigFrom";
import { redactConfigSecrets } from "../../shared/redactConfigSecrets";
import { assistConfigSchema } from "../../shared/types";
import { configHelpForKey } from "./configHelpForKey";
import { getNestedValue } from "./getNestedValue";
import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";
import { readRawConfigLayers } from "./readRawConfigLayers";
import type { ConfigSource } from "./resolveConfigSources";
import { resolveConfigSources } from "./resolveConfigSources";
import { configEntryNode } from "./configEntryNode";

export type ConfigEntry = ConfigLeaf & {
	value: unknown;
	source: ConfigSource;
	sources?: ConfigSource[];
	repoKey?: string;
	globalOnly?: boolean;
	node?: ConfigNode;
	note?: string;
	setter?: string;
};

const KEYS_STRIPPED_FROM_MERGED_CONFIG = new Set(["repos"]);

export function readConfigEntries(cwd: string): ConfigEntry[] {
	const config = loadConfigFrom(cwd) as unknown as Record<string, unknown>;
	const layers = readRawConfigLayers(cwd);
	const schema = describeConfigNode(assistConfigSchema);
	return describeConfigLeaves(assistConfigSchema)
		.filter((leaf) => !KEYS_STRIPPED_FROM_MERGED_CONFIG.has(leaf.key))
		.map((leaf) => {
			const sources = resolveConfigSources(leaf.key, layers);
			const source = sources[0] ?? "default";
			const node = configEntryNode(schema, leaf.key);
			const help = configHelpForKey(leaf.key);
			return {
				...leaf,
				...(help ? { note: help.note, setter: help.setter } : {}),
				...(leaf.defaultValue === undefined
					? {}
					: { defaultValue: redactConfigSecrets(leaf.defaultValue, node) }),
				value: redactConfigSecrets(getNestedValue(config, leaf.key), node),
				source,
				sources,
				...(layers.repoKey ? { repoKey: layers.repoKey } : {}),
				globalOnly: isGlobalOnlyConfigKey(leaf.key),
				node,
			};
		});
}
