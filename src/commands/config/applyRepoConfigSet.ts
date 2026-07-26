import { loadGlobalConfigRaw, saveGlobalConfig } from "../../shared/loadConfig";
import { resolveNamedRepoWriteLabel } from "../../shared/resolveNamedRepoWriteLabel";
import { resolveRepoWriteLabel } from "../../shared/resolveRepoOverride";
import { repoConfigSchema } from "../../shared/types";
import { getCurrentOrigin } from "../backlog/getCurrentOrigin";
import type { ConfigWritableValue } from "./applyConfigSet";
import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";
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
): RepoConfigSetResult {
	if (isGlobalOnlyConfigKey(key)) {
		return {
			ok: false,
			errors: [
				`"${key}" is a global-only key. Set it in ~/.assist.yml rather than under repos:`,
			],
		};
	}
	const globalRaw = loadGlobalConfigRaw();
	const label =
		repoName === undefined
			? resolveRepoWriteLabel(globalRaw, getCurrentOrigin(cwd))
			: resolveNamedRepoWriteLabel(globalRaw, repoName);
	const repos = isPlainObject(globalRaw.repos) ? { ...globalRaw.repos } : {};
	const existingBlock = isPlainObject(repos[label]) ? repos[label] : {};
	const updatedBlock = setNestedValue(existingBlock, key, coerced);
	const validation = validateConfig(updatedBlock, key, repoConfigSchema);
	if (!validation.ok) return validation;
	repos[label] = updatedBlock;
	saveGlobalConfig({ ...globalRaw, repos });
	return { ok: true, target: "repo", label };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
