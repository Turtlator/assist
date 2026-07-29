const HEADER_RE = /^<<-?[ \t]*(?:'([^']*)'|"([^"]*)"|([^\s;|&<>()'"$`]+))/;

type HeredocHeader = { text: string; delimiter?: string };

export function matchHeredocHeader(
	command: string,
	start: number,
): HeredocHeader {
	let end = start;
	while (command[end] === "<") end++;
	const angles = command.slice(start, end);
	if (angles.length !== 2) return { text: angles };

	const match = HEADER_RE.exec(command.slice(start));
	if (!match) return { text: angles };
	return { text: match[0], delimiter: match[1] ?? match[2] ?? match[3] };
}
