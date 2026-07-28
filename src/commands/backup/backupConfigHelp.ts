import type { ConfigHelpEntry } from "../../shared/configHelp";

export const backupConfigHelp: ConfigHelpEntry[] = [
	{
		key: "backup.dir",
		setter: "assist config set backup.dir ~/.assist/backups",
		note: "directory dumps are written to (default: ~/.assist/backups)",
	},
];
