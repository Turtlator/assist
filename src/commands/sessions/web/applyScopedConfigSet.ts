import {
	applyConfigSet,
	type ConfigWritableValue,
} from "../../config/applyConfigSet";
import { applyRepoConfigSet } from "../../config/applyRepoConfigSet";
import type { ConfigWriteScope } from "../../config/ConfigWriteScope";

type ScopedConfigSetResult =
	| { ok: true; payload: Record<string, unknown> }
	| { ok: false; errors: string[] };

export function applyScopedConfigSet(
	key: string,
	value: ConfigWritableValue,
	cwd: string,
	scope: ConfigWriteScope,
): ScopedConfigSetResult {
	if (scope === "repo") {
		const result = applyRepoConfigSet(key, value, undefined, cwd);
		return result.ok
			? { ok: true, payload: { target: result.target, repoKey: result.label } }
			: result;
	}
	const result = applyConfigSet(key, value, scope === "global", cwd);
	return result.ok ? { ok: true, payload: { target: result.target } } : result;
}
