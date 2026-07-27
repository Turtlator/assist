import { describeConfigLeaves } from "../../shared/describeConfigLeaves";
import { assistConfigSchema } from "../../shared/types";
import type { ConfigWritableValue } from "./applyConfigSet";
import { coerceConfigValue } from "./coerceConfigValue";

type CoerceCliConfigValueResult =
	| { ok: true; value: ConfigWritableValue }
	| { ok: false; error: string };

export function coerceCliConfigValue(
	key: string,
	raw: string,
): CoerceCliConfigValueResult {
	const leaf = describeConfigLeaves(assistConfigSchema).find(
		(candidate) => candidate.key === key,
	);
	if (!leaf) return { ok: true, value: coerceWithoutSchemaLeaf(raw) };
	if (leaf.itemType) return coerceConfigValue(key, splitList(raw));
	return coerceConfigValue(key, raw);
}

function splitList(raw: string): string[] {
	return raw
		.split(",")
		.map((item) => item.trim())
		.filter((item) => item !== "");
}

function coerceWithoutSchemaLeaf(raw: string): string | boolean {
	if (raw === "true") return true;
	if (raw === "false") return false;
	return raw;
}
