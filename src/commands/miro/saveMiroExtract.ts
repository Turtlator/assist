import {
	getGlobalConfigPath,
	projectConfigPathFrom,
} from "../../shared/loadConfigFrom";
import type { MiroExtractConfig } from "../../shared/types";
import { applyConfigSet } from "../config/applyConfigSet";
import { applyRepoConfigSet } from "../config/applyRepoConfigSet";
import { globalConfigFileLabel } from "../config/globalConfigFileLabel";
import { MiroExtractError } from "./MiroExtractError";
import type { MiroExtractOptions, MiroExtractPaths } from "./types";

function saveToRepo(
	key: string,
	extract: MiroExtractConfig,
	repo: boolean | string,
	{ cwd, globalConfigPath }: Required<MiroExtractPaths>,
): string {
	const result = applyRepoConfigSet(
		key,
		extract,
		typeof repo === "string" ? repo : undefined,
		cwd,
		globalConfigPath,
	);
	if (!result.ok) throw new MiroExtractError(result.errors.join("\n"));
	return `${globalConfigFileLabel(globalConfigPath)} under repos.${result.label}`;
}

export function saveMiroExtract(
	name: string,
	extract: MiroExtractConfig,
	options: MiroExtractOptions,
	paths: MiroExtractPaths = {},
): string {
	const resolved = {
		cwd: paths.cwd ?? process.cwd(),
		globalConfigPath: paths.globalConfigPath ?? getGlobalConfigPath(),
	};
	if (options.repo !== undefined && !options.global)
		throw new MiroExtractError(
			"--repo writes to the global config; add -g (e.g. -g --repo)",
		);
	const key = `miro.extracts.${name}`;
	if (options.repo !== undefined)
		return saveToRepo(key, extract, options.repo, resolved);
	const result = applyConfigSet(
		key,
		extract,
		options.global ?? false,
		resolved.cwd,
		resolved.globalConfigPath,
	);
	if (!result.ok) throw new MiroExtractError(result.errors.join("\n"));
	return result.target === "global"
		? globalConfigFileLabel(resolved.globalConfigPath)
		: projectConfigPathFrom(resolved.cwd);
}
