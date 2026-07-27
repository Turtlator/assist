import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { getCurrentOrigin } from "../commands/backlog/getCurrentOrigin";
import { linkedWorktree } from "./linkedWorktree";
import { loadRawYaml } from "./loadRawYaml";
import { mergeRawConfigs } from "./mergeDenyRules";
import { resolveRepoOverride } from "./resolveRepoOverride";
import { type AssistConfig, assistConfigSchema } from "./types";

export function findConfigUp(
	startDir: string,
): { configPath: string; rootDir: string } | null {
	let current = startDir;
	while (current !== dirname(current)) {
		const claudePath = join(current, ".claude", "assist.yml");
		if (existsSync(claudePath))
			return { configPath: claudePath, rootDir: current };
		const rootPath = join(current, "assist.yml");
		if (existsSync(rootPath)) return { configPath: rootPath, rootDir: current };
		current = dirname(current);
	}
	return null;
}

function getConfigPathFrom(cwd: string): string {
	const found = findConfigUp(cwd);
	if (found) return found.configPath;
	return join(cwd, "assist.yml");
}

export function getGlobalConfigPath(): string {
	return join(homedir(), ".assist.yml");
}

export function getConfigDirFrom(cwd: string): string {
	return dirname(getConfigPathFrom(cwd));
}

export function projectConfigPathFrom(cwd: string): string {
	if (findConfigUp(cwd)) return getConfigPathFrom(cwd);
	const clone = linkedWorktree(cwd)?.clone;
	return getConfigPathFrom(clone ?? cwd);
}

export function loadConfigFrom(cwd: string): AssistConfig {
	const globalRaw = loadRawYaml(getGlobalConfigPath());
	const projectRaw = loadRawYaml(projectConfigPathFrom(cwd));
	const repoOverride = globalRaw.repos
		? resolveRepoOverride(globalRaw, getCurrentOrigin(cwd))
		: {};
	const globalWithRepo = mergeRawConfigs(globalRaw, repoOverride);
	const merged = mergeRawConfigs(globalWithRepo, projectRaw);
	delete merged.repos;
	delete merged.news;
	return assistConfigSchema.parse(merged);
}
