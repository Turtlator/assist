import type { ConfigEntry } from "../../../config/readConfigEntries";
import type { ConfigScope } from "./saveConfigValue";

export function nothingToClearMessage(
	entry: ConfigEntry,
	scope: ConfigScope,
): string {
	const where =
		scope === "repo"
			? `repos.${entry.repoKey ?? "<repo>"} in ~/.assist.yml`
			: `the ${scope} config`;
	const base = `${entry.key} is not set in ${where} — nothing was removed.`;
	if (entry.source === "repo")
		return `${base} Its value is pinned by repos.${entry.repoKey ?? "<repo>"} in ~/.assist.yml.`;
	if (entry.source === "default") return base;
	return `${base} It comes from the ${entry.source} config.`;
}
