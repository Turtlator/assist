import {
	loadGlobalConfigRaw,
	loadProjectConfig,
	saveConfig,
	saveGlobalConfig,
} from "../../shared/loadConfig";
import { setNestedValue } from "./setNestedValue";
import { validateConfig } from "./validateConfig";

const GLOBAL_ONLY_KEYS = ["sync.autoConfirm"];

export type ConfigScalar = string | number | boolean;

type ConfigSetResult =
	| { ok: true; target: "global" | "project" }
	| { ok: false; errors: string[] };

export function applyConfigSet(
	key: string,
	coerced: ConfigScalar,
	global: boolean,
	cwd: string = process.cwd(),
): ConfigSetResult {
	if (!global && isGlobalOnly(key)) {
		return {
			ok: false,
			errors: [
				`"${key}" is a global-only key. Use --global to set it in ~/.assist.yml`,
			],
		};
	}
	const raw = global ? loadGlobalConfigRaw() : loadProjectConfig(cwd);
	const updated = setNestedValue(raw, key, coerced);
	const validation = validateConfig(updated, key);
	if (!validation.ok) return validation;
	if (global) {
		saveGlobalConfig(updated);
		return { ok: true, target: "global" };
	}
	saveConfig(updated, cwd);
	return { ok: true, target: "project" };
}

function isGlobalOnly(key: string): boolean {
	return GLOBAL_ONLY_KEYS.some((k) => key.startsWith(k));
}
