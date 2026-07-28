import type { ConfigHelpEntry } from "../../shared/configHelp";
import { configHelpEntries } from "../configHelpEntries";

let byKey: Map<string, ConfigHelpEntry> | undefined;

export function configHelpForKey(key: string): ConfigHelpEntry | undefined {
	byKey ??= new Map(configHelpEntries.map((entry) => [entry.key, entry]));
	return byKey.get(key);
}
