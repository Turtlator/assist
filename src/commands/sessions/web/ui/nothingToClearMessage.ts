import type { ConfigEntry } from "../../../config/readConfigEntries";
import type { ConfigScope } from "./saveConfigValue";

export function nothingToClearMessage(
	entry: ConfigEntry,
	scope: ConfigScope,
): string {
	const base = `${entry.key} is not set in the ${scope} config — nothing was removed.`;
	if (entry.source === "repo")
		return `${base} Its value is pinned by repos.${entry.repoKey ?? "<repo>"} in ~/.assist.yml.`;
	if (entry.source === "default") return base;
	return `${base} It comes from the ${entry.source} config.`;
}
