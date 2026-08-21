import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { stringify } from "yaml";
import type { MiroSource } from "./miroSource";
import type { MiroRect } from "./types";

type ExtractHeader = MiroSource & {
	topLeft: string;
	bottomRight: string;
	rect: MiroRect;
};

function headerLines(header: ExtractHeader): string[] {
	const { rect } = header;
	return [
		`# board: ${header.board ?? "unknown"}`,
		`# frame: ${header.frame ?? "unknown"}`,
		`# top-left: ${header.topLeft}`,
		`# bottom-right: ${header.bottomRight}`,
		`# rectangle: ${rect.left},${rect.top} to ${rect.right},${rect.bottom}`,
	];
}

export function writeExtract(
	file: string,
	header: ExtractHeader,
	texts: string[],
): void {
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, `${headerLines(header).join("\n")}\n${stringify(texts)}`);
}
