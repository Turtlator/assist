import { describeConfigLeaves } from "../../shared/describeConfigLeaves";
import { getGlobalConfigPath } from "../../shared/loadConfigFrom";
import { assistConfigSchema } from "../../shared/types";
import { configEntryContext } from "./configEntryContext";
import { configEntryFor } from "./configEntryFor";

export type { ConfigEntry } from "./ConfigEntry";

const KEYS_STRIPPED_FROM_MERGED_CONFIG = new Set(["repos"]);

export function readConfigEntries(
	cwd: string,
	globalConfigPath: string = getGlobalConfigPath(),
) {
	const context = configEntryContext(cwd, globalConfigPath);
	return describeConfigLeaves(assistConfigSchema)
		.filter((leaf) => !KEYS_STRIPPED_FROM_MERGED_CONFIG.has(leaf.key))
		.map((leaf) => configEntryFor(leaf, context));
}
