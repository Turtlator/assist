import chalk from "chalk";
import { resolveMiroExtract } from "./resolveMiroExtract";
import type { MiroExtractOptions, MiroExtractPaths } from "./types";

export function resolveExtractOptions(
	name: string | undefined,
	options: MiroExtractOptions,
	paths: MiroExtractPaths,
): MiroExtractOptions {
	if (!name) return options;
	const resolved = resolveMiroExtract(
		name,
		options,
		paths.cwd,
		paths.globalConfigPath,
	);
	console.error(chalk.dim(`Extract "${name}" from ${resolved.from}`));
	return resolved.options;
}
