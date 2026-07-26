import type { PlanPhase } from "../types";
import { classifyPhase } from "./classifyPhase";
import { isCompleted } from "./isCompleted";
import { matchStoredPhases } from "./matchStoredPhases";
import type { PlanUpdatePhase } from "./planUpdateSchema";
import type { DiffPhase, PlanDiff } from "./types";

function fromStored(phase: PlanPhase): DiffPhase {
	return {
		name: phase.name,
		tasks: phase.tasks.map((t) => t.task),
		manualChecks: phase.manualChecks ?? [],
	};
}

export function diffPlan(
	storedPlan: PlanPhase[] | undefined,
	payloadPhases: PlanUpdatePhase[],
	currentPhase: number | undefined,
): PlanDiff {
	const stored = (storedPlan ?? []).map(fromStored);
	const payload: DiffPhase[] = payloadPhases.map((phase) => ({
		name: phase.name,
		tasks: phase.tasks,
		manualChecks: phase.manualChecks,
	}));

	const matches = matchStoredPhases(payload, stored);
	const phases = payload.map((phase, idx) =>
		classifyPhase(phase, idx, matches[idx], stored, currentPhase),
	);

	const matched = new Set(matches.filter((idx) => idx !== undefined));
	const removed = stored.flatMap((phase, idx) =>
		matched.has(idx)
			? []
			: [
					{
						phase,
						previousPosition: idx + 1,
						wasCompleted: isCompleted(idx + 1, currentPhase),
					},
				],
	);

	return { phases, removed };
}
