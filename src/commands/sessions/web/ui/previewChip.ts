import type { PrPreview } from "../../shared/SessionInfoBase";

type ChipSpec = { label: string; color: "success" | "info" | "warning" };

export function previewChip(preview: PrPreview): ChipSpec {
	if (preview.kind === "backlog-item")
		return preview.itemType === "bug"
			? { label: "Bug", color: "warning" }
			: { label: "Story", color: "info" };

	return preview.prNumber === null
		? { label: "New PR", color: "success" }
		: { label: `Update #${preview.prNumber}`, color: "info" };
}
