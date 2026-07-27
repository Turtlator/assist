import { awaitClaude } from "../../shared/awaitClaude";
import type { HarnessKind } from "../../shared/harnesses";
import type { SpawnClaudeOptions } from "../../shared/spawnClaude";
import { spawnHarness } from "../../shared/spawnHarness";
import { stopWatching, watchForMarker } from "./watchForMarker";

export async function launchPhaseClaude(
	prompt: string,
	spawnOptions: SpawnClaudeOptions,
	context: string,
	harness: HarnessKind = "claude",
): Promise<number | null> {
	const { child, done } = spawnHarness(harness, prompt, {
		...spawnOptions,
		cwd: process.cwd(),
	});
	watchForMarker(child);
	const exitCode = await awaitClaude(done, context);
	stopWatching();
	return exitCode;
}
