export function skipHeredocBodies(
	command: string,
	start: number,
	delimiters: string[],
): number {
	let i = start;
	for (const delimiter of delimiters) i = skipBody(command, i, delimiter);
	return i;
}

function skipBody(command: string, start: number, delimiter: string): number {
	let i = start;
	while (i < command.length) {
		const newline = command.indexOf("\n", i);
		const line = command.slice(i, newline === -1 ? command.length : newline);
		i = newline === -1 ? command.length : newline + 1;
		if (line.trim() === delimiter) return i;
	}
	return i;
}
