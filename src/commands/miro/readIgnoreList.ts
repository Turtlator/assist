import { existsSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { MiroExtractError } from "./MiroExtractError";

export function readIgnoreList(file: string): string[] {
	if (!existsSync(file))
		throw new MiroExtractError(
			`No ignore file at ${file}. Write a YAML list of the box texts to drop, or omit --ignore.`,
		);
	const parsed = parse(readFileSync(file, "utf8")) as unknown;
	if (parsed === null || parsed === undefined) return [];
	if (
		!Array.isArray(parsed) ||
		parsed.some((entry) => typeof entry !== "string")
	)
		throw new MiroExtractError(
			`${file} must be a YAML list of box texts to drop, one string per entry.`,
		);
	return parsed.map((entry) => (entry as string).trim()).filter(Boolean);
}
