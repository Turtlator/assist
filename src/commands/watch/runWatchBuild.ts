import { findRunConfig } from "../run/findRunConfig";
import { resolveParams } from "../run/resolveParams";
import { MissingRunCwdError, resolveRunCwd } from "../run/resolveRunCwd";
import { runCommandToCompletion } from "../run/runCommandToCompletion";
import { runPreCommands } from "../run/runPreCommands";
import type { BuildOutcome } from "./BuildOutcome";

export async function runWatchBuild(entry: string): Promise<BuildOutcome> {
	const config = findRunConfig(entry);
	let cwd: string | undefined;
	try {
		cwd = resolveRunCwd(config);
	} catch (error) {
		if (!(error instanceof MissingRunCwdError)) throw error;
		return { kind: "failed", exitCode: 1, output: error.message };
	}
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
