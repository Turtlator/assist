import type { PrPreview } from "../../shared/SessionInfoBase";

type ChipSpec = { label: string; color: "success" | "info" | "warning" };

export function previewChip(preview: PrPreview, draft: boolean): ChipSpec {
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
