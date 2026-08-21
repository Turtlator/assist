import { Divider } from "@mui/material";
import { PrCommentList } from "./PrCommentList";
import { PrPreviewActions } from "./PrPreviewActions";
import type { PrPreviewFooterProps } from "./PrPreviewFooterProps";
import { SelectionCommentPopover } from "./SelectionCommentPopover";

export function PrPreviewFooter({
	comments,
	commentColors,
	pending,
	onAdd,
	onRemove,
	onCancel,
	onCollapse,
	onDecision,
	chain,
	editable,
	newPr,
	onChainChange,
}: PrPreviewFooterProps) {
	return (
		<>
			<PrCommentList
				comments={comments}
				colors={commentColors}
				onRemove={onRemove}
			/>
			<Divider />
			<PrPreviewActions
				commentCount={comments.length}
				chain={chain}
				newPr={newPr}
				onChainChange={onChainChange}
				onApprove={() => onDecision("approve", [])}
				onReject={() => onDecision("reject", [])}
				onRequestChanges={() =>
					onDecision(
						"reject",
						comments.map((c) => ({ quote: c.quote, note: c.note })),
					)
				}
			/>
			<SelectionCommentPopover
				pending={pending}
				editable={editable}
				onAdd={onAdd}
				onCancel={onCancel}
				onCollapse={onCollapse}
			/>
		</>
	);
}
