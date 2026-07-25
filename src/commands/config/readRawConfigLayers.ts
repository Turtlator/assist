import {
	getConfigPathFrom,
	getGlobalConfigPath,
} from "../../shared/loadConfigFrom";
import { loadRawYaml } from "../../shared/loadRawYaml";
import { resolveRepoOverride } from "../../shared/resolveRepoOverride";
import { getCurrentOrigin } from "../backlog/getCurrentOrigin";

export type RawConfigLayers = {
	project: Record<string, unknown>;
	global: Record<string, unknown>;
	repoOverride: Record<string, unknown>;
};

export function readRawConfigLayers(cwd: string): RawConfigLayers {
	const global = loadRawYaml(getGlobalConfigPath());
	return {
		project: loadRawYaml(getConfigPathFrom(cwd)),
		global,
		repoOverride: global.repos
			? resolveRepoOverride(global, getCurrentOrigin(cwd))
			: {},
	};
}
