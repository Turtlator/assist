import { saveGlobalConfig } from "../../shared/loadConfig";
import { repoConfigSchema } from "../../shared/types";
import type { ConfigWritableValue } from "./applyConfigSet";
import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";
import { resolveRepoConfigBlock } from "./resolveRepoConfigBlock";
import { setNestedValue } from "./setNestedValue";
import { validateConfig } from "./validateConfig";

type RepoConfigSetResult =
	| { ok: true; target: "repo"; label: string }
	| { ok: false; errors: string[] };

export function applyRepoConfigSet(
	key: string,
	coerced: ConfigWritableValue,
	repoName?: string,
	cwd: string = process.cwd(),
	globalConfigPath?: string,
): RepoConfigSetResult {
	if (isGlobalOnlyConfigKey(key)) {
		return {
			ok: false,
			errors: [
				`"${key}" is a global-only key. Set it in ~/.assist.yml rather than under repos:`,
			],
		};
	}
	const { globalRaw, repos, label, block } = resolveRepoConfigBlock(
		repoName,
		cwd,
		globalConfigPath,
	);
	const updatedBlock = setNestedValue(block, key, coerced);
	const validation = validateConfig(updatedBlock, key, repoConfigSchema);
	if (!validation.ok) return validation;
	repos[label] = updatedBlock;
	saveGlobalConfig({ ...globalRaw, repos }, globalConfigPath);
	return { ok: true, target: "repo", label };
}
