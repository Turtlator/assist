import { emitActivity } from "../../shared/emitActivity";
import { harnessActivityFields } from "../../shared/harnessActivityFields";
import type { HarnessKind } from "../../shared/harnesses";
import { REVIEW_PHASE_NAME } from "./buildPhasePrompt";
import type { BacklogItem, PlanPhase } from "./types";

export function reportPhaseActivity(
	item: BacklogItem,
	phaseNumber: number,
	totalPhases: number,
	phase: PlanPhase,
	claudeSessionId: string,
	harness?: HarnessKind,
): void {
	// why: review sits one slot beyond the authored plan (totalPhases counts it), so label it explicitly rather than trusting the appended phase's name.
	const isReviewPhase = phaseNumber >= totalPhases;
	emitActivity({
		kind: "backlog",
		itemId: item.id,
		itemName: item.name,
		phase: phaseNumber,
		phaseName: isReviewPhase ? REVIEW_PHASE_NAME : phase.name,
		totalPhases,
		...harnessActivityFields(harness, claudeSessionId),
	});
}
