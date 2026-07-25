import type { ProposedItem } from "./proposedItemSchema";

function renderPhase(phase: ProposedItem["phases"][number], i: number): string {
	const parts = [
		`### Phase ${i + 1}: ${phase.name}`,
		phase.tasks.map((task) => `- ${task}`).join("\n"),
	];

	if (phase.manualChecks.length > 0)
		parts.push(
			"**Manual checks:**",
			phase.manualChecks.map((check) => `- ${check}`).join("\n"),
		);

	return parts.join("\n\n");
}

export function renderProposedItem(item: ProposedItem): string {
	const sections = [`**Type:** ${item.type}`];

	if (item.description) sections.push("## Description", item.description);

	if (item.acceptanceCriteria.length > 0)
		sections.push(
			"## Acceptance Criteria",
			item.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join("\n"),
		);

	if (item.phases.length > 0)
		sections.push("## Plan", ...item.phases.map(renderPhase));

	return sections.join("\n\n");
}
