import type { ConfigHelpEntry } from "../../shared/configHelp";

export const configConfigHelp: ConfigHelpEntry[] = [
	{
		key: "repos",
		setter: "assist config set worktree.enabled true -g --repo",
		note: "per-repo override blocks in ~/.assist.yml, keyed by repo identity; written by 'config set -g --repo [name]'",
	},
];
