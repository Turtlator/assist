const ESCAPE_OR_QUOTED_OR_NEWLINE_RE = /\\[\s\S]|'[^']*'|"[^"]*"|(\n)/g;

export function separateCommandLines(command: string): string {
	if (!command.includes("\n")) return command;

	return command.replace(ESCAPE_OR_QUOTED_OR_NEWLINE_RE, (match, newline) =>
		newline === undefined ? match : ";",
	);
}
