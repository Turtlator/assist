import { renderPhaseSection } from "../renderPhaseSection";
import type { PlanDiff, PlanDiffPhase, PlanDiffRemovedPhase } from "./types";

function phaseNotes(entry: PlanDiffPhase, position: number): string[] {
	if (entry.change === "unchanged") return ["unchanged"];
	if (entry.change === "added") return ["added"];

	const notes =
		entry.change === "moved"
			? [`moved from phase ${entry.previousPosition}`]
			: ["edited"];

	if (entry.change === "edited") {
		if (entry.previousName) notes.push(`renamed from "${entry.previousName}"`);
		if (entry.previousPosition !== position)
			notes.push(`moved from phase ${entry.previousPosition}`);
	}

	if (entry.wasCompleted) notes.push("already completed");
	return notes;
}

function renderDiffPhase(entry: PlanDiffPhase, idx: number): string {
	const notes = phaseNotes(entry, idx + 1);
	const section = renderPhaseSection(
		{ ...entry.phase, name: `${entry.phase.name} (${notes.join(", ")})` },
		idx,
	);

	if (!entry.previousTasks) return section;
	return [
		section,
		"**Previously:**",
		entry.previousTasks.map((task) => `- ${task}`).join("\n"),
	].join("\n\n");
}

function renderRemovedPhase(entry: PlanDiffRemovedPhase): string {
	const notes = entry.wasCompleted ? "removed, already completed" : "removed";
	return renderPhaseSection(
		{ ...entry.phase, name: `${entry.phase.name} (${notes})` },
		entry.previousPosition - 1,
	);
}

export function renderPlanDiff(diff: PlanDiff): string[] {
	const sections = ["## Plan", ...diff.phases.map(renderDiffPhase)];
	if (diff.removed.length === 0) return sections;
	return [
		...sections,
		"## Removed phases",
		...diff.removed.map(renderRemovedPhase),
	];
}
