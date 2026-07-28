import type { ConfigEntry } from "../../../config/readConfigEntries";
import { configScopeFiles } from "./configScopeFiles";
import { configScopeLabels } from "./configScopeLabels";
import { configScopesWithValue } from "./configScopesWithValue";
import type { ConfigScope } from "./saveConfigValue";

export function configClearTitle(
	entry: ConfigEntry,
	scope: ConfigScope,
): string {
	const where = configScopeFiles(entry.repoKey)[scope];
	const scopesWithValue = configScopesWithValue(entry);
	if (!scopesWithValue.includes(scope))
		return `${entry.key} is not set in ${where} — nothing to clear`;

	const fallback = scopesWithValue.find((source) => source !== scope);
	return fallback
		? `Remove ${entry.key} from ${where} — falls back to ${configScopeLabels[fallback]}`
		: `Remove ${entry.key} from ${where} — reverts to the schema default`;
}
