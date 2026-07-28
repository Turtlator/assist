import type { ConfigHelpEntry } from "../../shared/configHelp";

export const branchConfigHelp: ConfigHelpEntry[] = [
	{
		key: "branch.prefix",
		setter: "assist config set branch.prefix sw",
		note: 'optional; prepends "<prefix>/" (omitted when unset)',
	},
	{
		key: "branch.defaultBranch",
		setter: "assist config set branch.defaultBranch main",
		note: "optional; overrides the live remote default branch",
	},
];
