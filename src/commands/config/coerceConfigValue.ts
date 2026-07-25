import { describeConfigLeaves } from "../../shared/describeConfigLeaves";
import { assistConfigSchema } from "../../shared/types";
import type { ConfigScalar } from "./applyConfigSet";

type CoerceConfigValueResult =
	| { ok: true; value: ConfigScalar }
	| { ok: false; error: string };

const EDITABLE_TYPES = new Set(["string", "number", "boolean", "enum"]);

export function coerceConfigValue(
	key: string,
	raw: unknown,
): CoerceConfigValueResult {
	const leaf = describeConfigLeaves(assistConfigSchema).find(
		(candidate) => candidate.key === key,
	);
	if (!leaf) return { ok: false, error: `Unknown config key "${key}"` };
	if (!EDITABLE_TYPES.has(leaf.type)) {
		return {
			ok: false,
			error: `"${key}" is a ${leaf.type} value and is read-only here`,
		};
	}
	if (leaf.type === "boolean") return coerceBoolean(key, raw);
	if (leaf.type === "number") return coerceNumber(key, raw);
	return coerceString(key, raw);
}

function coerceBoolean(key: string, raw: unknown): CoerceConfigValueResult {
	if (typeof raw === "boolean") return { ok: true, value: raw };
	if (raw === "true") return { ok: true, value: true };
	if (raw === "false") return { ok: true, value: false };
	return { ok: false, error: `${key}: expected a boolean` };
}

function coerceNumber(key: string, raw: unknown): CoerceConfigValueResult {
	if (typeof raw === "number" && Number.isFinite(raw)) {
		return { ok: true, value: raw };
	}
	if (typeof raw === "string" && raw.trim() !== "") {
		const parsed = Number(raw);
		if (Number.isFinite(parsed)) return { ok: true, value: parsed };
	}
	return { ok: false, error: `${key}: expected a number` };
}

function coerceString(key: string, raw: unknown): CoerceConfigValueResult {
	if (typeof raw === "string") return { ok: true, value: raw };
	return { ok: false, error: `${key}: expected a string` };
}
