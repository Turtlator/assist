import { REVIEW_PHASE_NAME } from "./buildPhasePrompt";
import { buildReviewPhase } from "./buildReviewPhase";
import type { PlanPhase } from "./types";

export function appendReviewPhase(plan: PlanPhase[]): PlanPhase[] {
	if (plan.at(-1)?.name === REVIEW_PHASE_NAME) return plan;
	return [...plan, buildReviewPhase()];
}
