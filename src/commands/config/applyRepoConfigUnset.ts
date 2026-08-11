import { saveGlobalConfig } from "../../shared/loadConfig";
import { repoConfigSchema } from "../../shared/types";
import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";
import { resolveRepoConfigBlock } from "./resolveRepoConfigBlock";
import { unsetNestedValue } from "./unsetNestedValue";
import { validateConfig } from "./validateConfig";

type RepoConfigUnsetResult =
	| { ok: true; target: "repo"; label: string; removed: boolean }
	| { ok: false; errors: string[] };

export function applyRepoConfigUnset(
	key: string,
	repoName?: string,
	cwd: string = process.cwd(),
	globalConfigPath?: string,
): RepoConfigUnsetResult {
	if (isGlobalOnlyConfigKey(key)) {
		return {
			ok: false,
			errors: [
				`"${key}" is a global-only key. Unset it in ~/.assist.yml rather than under repos:`,
			],
		};
	}
	const { globalRaw, repos, label, block } = resolveRepoConfigBlock(
		repoName,
		cwd,
		globalConfigPath,
	);
	const { config: updatedBlock, removed } = unsetNestedValue(block, key);
	if (!removed) return { ok: true, target: "repo", label, removed: false };

	const validation = validateConfig(updatedBlock, key, repoConfigSchema);
	if (!validation.ok) return validation;

	if (Object.keys(updatedBlock).length === 0) delete repos[label];
	else repos[label] = updatedBlock;

	const next = { ...globalRaw };
	if (Object.keys(repos).length === 0) delete next.repos;
	else next.repos = repos;
	saveGlobalConfig(next, globalConfigPath);
	return { ok: true, target: "repo", label, removed: true };
}
