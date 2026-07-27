import { buildPhasePrompt } from "./buildPhasePrompt";
import { launchPhaseClaude } from "./launchPhaseClaude";
import { resumeNudge } from "./resumeNudge";
import type { BacklogItem, BacklogRunOptions, PlanPhase } from "./types";

export function launchPhaseSession(
	item: BacklogItem,
	phaseNumber: number,
	phase: PlanPhase,
	phaseLabel: string,
	claudeSessionId: string,
	spawnOptions?: BacklogRunOptions,
): Promise<number | null> {
	const harness = spawnOptions?.harness;
	const { harness: _harness, ...phaseOptions } = spawnOptions ?? {};
	const resumeSessionId = phaseOptions.resumeSessionId;
	return launchPhaseClaude(
		resumeSessionId
			? resumeNudge()
			: buildPhasePrompt(item, phaseNumber, phase),
		resumeSessionId
			? phaseOptions
			: { ...phaseOptions, sessionId: claudeSessionId },
		phaseLabel,
		harness,
	);
}
