import { matchHeredocHeader } from "./matchHeredocHeader";
import { skipHeredocBodies } from "./skipHeredocBodies";

export function stripHeredocBodies(command: string): string {
	if (!command.includes("<<")) return command;

	let out = "";
	let pending: string[] = [];
	let quote: string | undefined;
	let i = 0;

	while (i < command.length) {
		const char = command[i];
		if (char === "\\" && quote !== "'" && i + 1 < command.length) {
			out += command.slice(i, i + 2);
			i += 2;
			continue;
		}
		if (quote) {
			if (char === quote) quote = undefined;
			out += char;
			i++;
			continue;
		}
		if (char === "'" || char === '"') {
			quote = char;
			out += char;
			i++;
			continue;
		}
		if (char === "\n" && pending.length > 0) {
			out += char;
			i = skipHeredocBodies(command, i + 1, pending);
			pending = [];
			continue;
		}
		if (char === "<") {
			const header = matchHeredocHeader(command, i);
			if (header.delimiter !== undefined) pending.push(header.delimiter);
			out += header.text;
			i += header.text.length;
			continue;
		}
		out += char;
		i++;
	}

	return out;
}
