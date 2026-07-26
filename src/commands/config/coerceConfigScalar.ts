import type { ConfigScalarLeafType } from "../../shared/scalarUnionMembers";
import type { ConfigScalar } from "./applyConfigSet";

type CoerceScalarResult =
	| { ok: true; value: ConfigScalar }
	| { ok: false; error: string };

export function coerceConfigScalar(
	key: string,
	raw: unknown,
	type: ConfigScalarLeafType,
): CoerceScalarResult {
	if (type === "boolean") return coerceBoolean(key, raw);
	if (type === "number") return coerceNumber(key, raw);
	return coerceString(key, raw);
}

function coerceBoolean(key: string, raw: unknown): CoerceScalarResult {
	if (typeof raw === "boolean") return { ok: true, value: raw };
	if (raw === "true") return { ok: true, value: true };
	if (raw === "false") return { ok: true, value: false };
	return { ok: false, error: `${key}: expected a boolean` };
}

function coerceNumber(key: string, raw: unknown): CoerceScalarResult {
	if (typeof raw === "number" && Number.isFinite(raw)) {
		return { ok: true, value: raw };
	}
	if (typeof raw === "string" && raw.trim() !== "") {
		const parsed = Number(raw);
		if (Number.isFinite(parsed)) return { ok: true, value: parsed };
	}
	return { ok: false, error: `${key}: expected a number` };
}

function coerceString(key: string, raw: unknown): CoerceScalarResult {
	if (typeof raw === "string") return { ok: true, value: raw };
	return { ok: false, error: `${key}: expected a string` };
}
