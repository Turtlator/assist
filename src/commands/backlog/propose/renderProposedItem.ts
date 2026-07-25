import type { ProposedItem } from "./proposedItemSchema";

export function renderProposedItem(item: ProposedItem): string {
	const sections = [`**Type:** ${item.type}`];

	if (item.description) sections.push("## Description", item.description);

	if (item.acceptanceCriteria.length > 0)
		sections.push(
			"## Acceptance Criteria",
			item.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join("\n"),
		);

	return sections.join("\n\n");
}
