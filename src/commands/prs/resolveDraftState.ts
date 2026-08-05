import { loadConfig } from "../../shared/loadConfig";

export type DraftOptionSource = {
	getOptionValueSource?: (key: string) => string | undefined;
};

export function resolveDraftState(
	options: { draft?: boolean },
	command?: DraftOptionSource,
): boolean {
	const source = command?.getOptionValueSource?.("draft");
	if (source === "cli" || source === "env") return options.draft === true;
	return loadConfig().prs?.draft ?? false;
}
