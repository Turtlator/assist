import type { ConfigHelpEntry } from "../../shared/configHelp";

export const cliHookConfigHelp: ConfigHelpEntry[] = [
	{
		key: "cliReadVerbs",
		setter: 'assist config set cliReadVerbs.git "status"',
		note: "extra per-CLI verbs treated as read-only for auto-approval",
	},
];
