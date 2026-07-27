import {
	getGlobalConfigPath,
	projectConfigPathFrom,
} from "../../shared/loadConfigFrom";
import { loadRawYaml } from "../../shared/loadRawYaml";
import {
	matchRepoConfigKey,
	resolveRepoOverride,
} from "../../shared/resolveRepoOverride";
import { getCurrentOrigin } from "../backlog/getCurrentOrigin";

export type RawConfigLayers = {
	project: Record<string, unknown>;
	global: Record<string, unknown>;
	repoOverride: Record<string, unknown>;
	repoKey?: string;
};

export function readRawConfigLayers(cwd: string): RawConfigLayers {
	const global = loadRawYaml(getGlobalConfigPath());
	if (!global.repos)
		return {
			project: loadRawYaml(projectConfigPathFrom(cwd)),
			global,
			repoOverride: {},
		};

	const origin = getCurrentOrigin(cwd);
	return {
		project: loadRawYaml(projectConfigPathFrom(cwd)),
		global,
		repoOverride: resolveRepoOverride(global, origin),
		repoKey: matchRepoConfigKey(global, origin),
	};
}
