import { stringify } from "yaml";
import type { MiroSource } from "./miroSource";
import type { MiroRect } from "./types";
import { writeExtract } from "./writeExtract";

type ExtractOutput = MiroSource & {
	topLeft: string;
	bottomRight: string;
	rect: MiroRect;
};

export function emitExtract(
	out: string | undefined,
	header: ExtractOutput,
	texts: string[],
): void {
	if (!out) {
		process.stdout.write(stringify(texts));
		return;
	}
	writeExtract(out, header, texts);
	console.log(
		`Wrote ${texts.length} ${texts.length === 1 ? "box" : "boxes"} to ${out}`,
	);
}
