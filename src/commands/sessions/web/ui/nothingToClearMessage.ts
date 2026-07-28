import type { ConfigEntry } from "../../../config/readConfigEntries";
import { configScopeFiles } from "./configScopeFiles";
import type { ConfigScope } from "./saveConfigValue";

export function nothingToClearMessage(
	entry: ConfigEntry,
	scope: ConfigScope,
): string {
	const where = configScopeFiles(entry.repoKey)[scope];
	return `${entry.key} is no longer set in ${where} — nothing was removed.`;
}
