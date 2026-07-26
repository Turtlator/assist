import { configLeafSchema } from "../../shared/configLeafSchema";
import {
	type ConfigPathSegment,
	formatConfigPath,
} from "../../shared/formatConfigPath";
import { assistConfigSchema } from "../../shared/types";
import type { ConfigWritableValue } from "./applyConfigSet";

type StructuredResult =
	| { ok: true; value: ConfigWritableValue }
	| { ok: false; error: string };

type SchemaIssue = { path: PropertyKey[]; message: string };

export function coerceStructuredConfigValue(
	key: string,
	raw: unknown,
): StructuredResult {
	const schema = configLeafSchema(assistConfigSchema, key);
	if (!schema) return { ok: false, error: `Unknown config key "${key}"` };
	const parsed = schema.safeParse(raw);
	if (parsed.success)
		return { ok: true, value: parsed.data as ConfigWritableValue };
	return {
		ok: false,
		error: parsed.error.issues
			.map((issue) => formatIssue(key, issue))
			.join("\n"),
	};
}

function formatIssue(key: string, issue: SchemaIssue): string {
	const path = formatConfigPath([
		{ kind: "key", name: key },
		...issue.path.map(toSegment),
	]);
	return `${path}: ${issue.message}`;
}

function toSegment(part: PropertyKey): ConfigPathSegment {
	return typeof part === "number"
		? { kind: "index", index: part }
		: { kind: "key", name: String(part) };
}
