import { loadConfig } from "../../shared/loadConfig";
import { resolveRunConfigs } from "../../shared/resolveRunConfigs";
import { runConfigBaseDir } from "../../shared/runConfigBaseDir";

export function formatConfiguredCommands(): string {
	const { run: entries } = loadConfig();
	const configs = resolveRunConfigs(entries, runConfigBaseDir());
	if (configs.length === 0) return "\nNo configured commands";
	const names = configs.map((r) => `  ${r.name}`).join("\n");
	return `\nConfigured commands:\n${names}`;
}
