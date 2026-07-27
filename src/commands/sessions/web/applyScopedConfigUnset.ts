import { applyConfigUnset } from "../../config/applyConfigUnset";
import { applyRepoConfigUnset } from "../../config/applyRepoConfigUnset";
import type { ConfigWriteScope } from "../../config/ConfigWriteScope";

type ScopedConfigUnsetResult =
	| { ok: true; payload: Record<string, unknown> }
	| { ok: false; errors: string[] };

export function applyScopedConfigUnset(
	key: string,
	cwd: string,
	scope: ConfigWriteScope,
): ScopedConfigUnsetResult {
	if (scope === "repo") {
		const result = applyRepoConfigUnset(key, undefined, cwd);
		return result.ok
			? {
					ok: true,
					payload: {
						target: result.target,
						repoKey: result.label,
						removed: result.removed,
					},
				}
			: result;
	}
	const result = applyConfigUnset(key, scope === "global", cwd);
	return result.ok
		? { ok: true, payload: { target: result.target, removed: result.removed } }
		: result;
}
