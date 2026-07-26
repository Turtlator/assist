import type { ConfigEntry } from "../../../config/readConfigEntries";
import { configScopesWithValue } from "./configScopesWithValue";
import type { ConfigScope } from "./saveConfigValue";

export function configClearTitle(
	entry: ConfigEntry,
	scope: ConfigScope,
): string {
	return configScopesWithValue(entry).includes(scope)
		? `Remove ${entry.key} from the ${scope} config`
		: `${entry.key} is not set in the ${scope} config — nothing to clear`;
}
