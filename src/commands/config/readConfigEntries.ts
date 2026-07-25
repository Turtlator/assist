import {
	type ConfigLeaf,
	describeConfigLeaves,
} from "../../shared/describeConfigLeaves";
import { loadConfigFrom } from "../../shared/loadConfigFrom";
import { assistConfigSchema } from "../../shared/types";
import { getNestedValue } from "./getNestedValue";

export type ConfigEntry = ConfigLeaf & { value: unknown };

const KEYS_STRIPPED_FROM_MERGED_CONFIG = new Set(["repos"]);

export function readConfigEntries(cwd: string): ConfigEntry[] {
	const config = loadConfigFrom(cwd) as unknown as Record<string, unknown>;
	return describeConfigLeaves(assistConfigSchema)
		.filter((leaf) => !KEYS_STRIPPED_FROM_MERGED_CONFIG.has(leaf.key))
		.map((leaf) => ({ ...leaf, value: getNestedValue(config, leaf.key) }));
}
