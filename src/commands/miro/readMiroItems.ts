import { readFileSync } from "node:fs";
import { MiroExtractError } from "./MiroExtractError";
import type { MiroRawItem, MiroRawPage } from "./types";

function tryParse(text: string): unknown {
	try {
		return JSON.parse(text) as unknown;
	} catch {
		return undefined;
	}
}

function toPage(value: unknown): MiroRawPage {
	const record = (value ?? {}) as MiroRawPage & MiroRawItem;
	if (Array.isArray(record.data)) return { data: record.data };
	return record.id ? { data: [record as MiroRawItem] } : {};
}

function parseJsonLines(raw: string, file: string): MiroRawPage[] {
	return raw
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const parsed = tryParse(line);
			if (parsed === undefined)
				throw new MiroExtractError(
					`${file} is not valid JSON or JSON lines. Save the raw board_list_items response pages without editing them.`,
				);
			return toPage(parsed);
		});
}

function parsePages(raw: string, file: string): MiroRawPage[] {
	const parsed = tryParse(raw);
	if (parsed === undefined) return parseJsonLines(raw, file);
	return Array.isArray(parsed) ? parsed.map(toPage) : [toPage(parsed)];
}

export function readMiroItems(file: string): MiroRawItem[] {
	const items = parsePages(readFileSync(file, "utf8"), file).flatMap(
		(page) => page.data ?? [],
	);
	if (items.length === 0)
		throw new MiroExtractError(
			`No board items found in ${file}. Dump the frame with board_list_items, paging until has_more is false.`,
		);
	return items;
}
