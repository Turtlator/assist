import type { PrPreview } from "../../shared/SessionInfoBase";

type ChipSpec = {
	label: string;
	color: "success" | "info" | "warning" | "default";
};

export function previewChip(preview: PrPreview, draft: boolean): ChipSpec {
	if (
		preview.kind === "backlog-comment" ||
		preview.kind === "pr-comment" ||
		preview.kind === "github-issue-comment"
	)
		return { label: "Comment", color: "default" };

	if (preview.kind === "github-issue-edit")
		return { label: "Edit", color: "warning" };

	if (preview.kind === "github-issue")
		return { label: "Issue", color: "warning" };

	if (preview.kind === "backlog-item")
		return preview.itemType === "bug"
			? { label: "Bug", color: "warning" }
			: { label: "Story", color: "info" };

	if (preview.prNumber !== null)
		return { label: `Update #${preview.prNumber}`, color: "info" };

	return draft
		? { label: "New draft PR", color: "success" }
		: { label: "New PR", color: "success" };
}
