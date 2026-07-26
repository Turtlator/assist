import type { BacklogItem } from "../types";
import { clampCurrentPhase } from "./clampCurrentPhase";
import { diffPlan } from "./diffPlan";
import type { PlanUpdatePhase } from "./planUpdateSchema";
import { renderPlanDiff } from "./renderPlanDiff";

function clampNote(item: BacklogItem, phaseCount: number): string | undefined {
	const currentPhase = item.currentPhase;
	if (currentPhase === undefined) return undefined;
	const clamped = clampCurrentPhase(currentPhase, phaseCount);
	if (clamped === currentPhase) return undefined;
	return `**Current phase:** ${currentPhase} → ${clamped ?? "none"} (clamped into the new plan of ${phaseCount} phase${phaseCount === 1 ? "" : "s"})`;
}

export function renderPlanUpdate(
	item: BacklogItem,
	phases: PlanUpdatePhase[],
): string {
	const note = clampNote(item, phases.length);
	const diff = diffPlan(item.plan, phases, item.currentPhase);
	const sections = note ? [note] : [];
	return [...sections, ...renderPlanDiff(diff)].join("\n\n");
}
