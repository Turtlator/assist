import { loadGlobalConfigRaw } from "../../shared/loadConfig";
import { resolveNamedRepoWriteLabel } from "../../shared/resolveNamedRepoWriteLabel";
import { resolveRepoWriteLabel } from "../../shared/resolveRepoOverride";
import { getCurrentOrigin } from "../backlog/getCurrentOrigin";

type RepoConfigBlock = {
	globalRaw: Record<string, unknown>;
	repos: Record<string, unknown>;
	label: string;
	block: Record<string, unknown>;
};

export function resolveRepoConfigBlock(
	repoName: string | undefined,
	cwd: string,
): RepoConfigBlock {
	const globalRaw = loadGlobalConfigRaw();
	const label =
		repoName === undefined
			? resolveRepoWriteLabel(globalRaw, getCurrentOrigin(cwd))
			: resolveNamedRepoWriteLabel(globalRaw, repoName);
	const repos = isPlainObject(globalRaw.repos) ? { ...globalRaw.repos } : {};
	const block = isPlainObject(repos[label]) ? repos[label] : {};
	return { globalRaw, repos, label, block };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
