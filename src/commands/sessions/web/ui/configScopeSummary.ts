import type { ConfigEntry } from "../../../config/readConfigEntries";
import type { ConfigSource } from "../../../config/resolveConfigSources";
import { configEntrySources } from "./configEntrySources";
import type { ConfigScope } from "./saveConfigValue";

function sourceLabel(
	source: ConfigSource,
	repoKey: string | undefined,
): string {
	return source === "repo" ? `repos.${repoKey ?? "<repo>"}` : source;
}

function joinLabels(labels: string[]): string {
	if (labels.length <= 1) return labels.join("");
	return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

export function configScopeSummary(
	entry: ConfigEntry,
	scope: ConfigScope,
): string {
	const sources = configEntrySources(entry);
	const label = (source: ConfigSource) => sourceLabel(source, entry.repoKey);

	if (sources.length === 0)
		return "Not set in project or global — showing the schema default.";

	const where = `Set in ${joinLabels(sources.map(label))}.`;
	if (!sources.includes(scope)) return `${where} Nothing to clear in ${scope}.`;

	const remaining = sources.filter((source) => source !== scope);
	if (remaining.length === 0)
		return `${where} Clear reverts it to the schema default.`;
	return `${where} Clear falls back to ${joinLabels(remaining.map(label))}.`;
}
