import { resolve } from "node:path";
import { getConfigDir } from "../../shared/loadConfig";
import { findRunConfig } from "../run/findRunConfig";
import { resolveParams } from "../run/resolveParams";
import { runCommandToCompletion } from "../run/runCommandToCompletion";
import { runPreCommands } from "../run/runPreCommands";
import type { BuildOutcome } from "./BuildOutcome";

export async function runWatchBuild(entry: string): Promise<BuildOutcome> {
	const config = findRunConfig(entry);
	const cwd = config.cwd ? resolve(getConfigDir(), config.cwd) : undefined;
	if (config.pre) runPreCommands(config.pre, cwd);

	const result = await runCommandToCompletion(
		config.command,
		[...(config.args ?? []), ...resolveParams(config.params, [])],
		config.env,
		cwd,
		config.quiet,
	);

	if (result.kind === "failed")
		return { kind: "failed", exitCode: 1, output: result.message };
	if (result.exitCode !== 0)
		return { kind: "failed", exitCode: result.exitCode, output: result.output };
	return { kind: "built" };
}
