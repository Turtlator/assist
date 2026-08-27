import { readFileSync } from "node:fs";
import type { VttCue } from "../types";
import { deduplicateCues, parseVtt } from "./parseVtt";

export function readCleanedCues(inputPath: string): VttCue[] {
	return deduplicateCues(parseVtt(readFileSync(inputPath, "utf8")));
}
