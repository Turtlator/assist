import type { ConfigHelpEntry } from "../../shared/configHelp";

export const denyConfigHelp: ConfigHelpEntry[] = [
	{
		key: "deny",
		setter: "assist deny add <pattern> <message>",
		note: "command patterns blocked with a correction message",
	},
];
