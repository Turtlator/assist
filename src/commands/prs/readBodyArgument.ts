import { readStdinBuffer } from "../backlog/import/readStdinBuffer";

export async function readBodyArgument(value: string): Promise<string> {
	if (value !== "-") return value;

	const body = (await readStdinBuffer()).toString("utf8").replace(/\n+$/, "");
	if (body.trim().length === 0) {
		console.error("Error: No body was provided on stdin.");
		process.exit(1);
	}
	return body;
}
