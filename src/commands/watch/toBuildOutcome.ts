import type { RunCommandResult } from "../run/RunCommandResult";
import type { BuildOutcome } from "./BuildOutcome";

export function toBuildOutcome(result: RunCommandResult): BuildOutcome {
	if (result.kind === "failed")
		return { kind: "failed", exitCode: 1, output: result.message };
	if (result.exitCode !== 0)
		return { kind: "failed", exitCode: result.exitCode, output: result.output };
	return { kind: "built" };
}
