import type { ConfigHelpEntry } from "../../shared/configHelp";

export const jiraConfigHelp: ConfigHelpEntry[] = [
	{
		key: "jira.acField",
		setter: "assist config set jira.acField customfield_11937",
		note: "custom field holding acceptance criteria (default: customfield_11937)",
	},
];
