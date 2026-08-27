import { existsSync } from "node:fs";
import { convertVttToMarkdown } from "./convertVttToMarkdown";

export function clean(file: string): void {
	if (!existsSync(file)) {
		console.error(`Error: VTT file not found: ${file}`);
		process.exit(1);
	}

	const markdown = convertVttToMarkdown(file);
	if (!markdown) {
		console.error(`Error: no cues found in: ${file}`);
		process.exit(1);
	}

	console.log(markdown);
}
