import { isCompleted } from "./isCompleted";
import { isIdenticalPhase, sameList } from "./matchStoredPhases";
import type { DiffPhase, PlanDiffPhase } from "./types";

export function classifyPhase(
	phase: DiffPhase,
	payloadIdx: number,
	storedIdx: number | undefined,
	stored: DiffPhase[],
	currentPhase: number | undefined,
): PlanDiffPhase {
	if (storedIdx === undefined)
		return { phase, change: "added", wasCompleted: false };

	const previous = stored[storedIdx];
	const previousPosition = storedIdx + 1;
	const wasCompleted = isCompleted(previousPosition, currentPhase);

	if (isIdenticalPhase(previous, phase))
		return {
			phase,
			change: storedIdx === payloadIdx ? "unchanged" : "moved",
			previousPosition,
			wasCompleted,
		};

	return {
		phase,
		change: "edited",
		previousPosition,
		wasCompleted,
		...(previous.name === phase.name ? {} : { previousName: previous.name }),
		...(sameList(previous.tasks, phase.tasks)
			? {}
			: { previousTasks: previous.tasks }),
	};
}
