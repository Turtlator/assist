import { Divider } from "@mui/material";
import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import type { PendingComment } from "./PendingComment";
import { PrCommentList } from "./PrCommentList";
import { PrPreviewActions } from "./PrPreviewActions";
import type { PrPreviewChain } from "./PrPreviewChain";
import { SelectionCommentPopover } from "./SelectionCommentPopover";
import type { LocalComment } from "./usePrComments";

export function PrPreviewFooter({
	comments,
	commentColors,
	pending,
	onAdd,
	onRemove,
	onCancel,
	onDecision,
	chain,
	newPr,
	onChainChange,
}: {
	comments: LocalComment[];
	commentColors: string[];
	pending: PendingComment | null;
	onAdd: (note: string) => void;
	onRemove: (id: number) => void;
	onCancel: () => void;
	onDecision: (
		decision: "approve" | "reject",
		comments: PrPreviewComment[],
	) => void;
	chain?: PrPreviewChain;
	newPr: boolean;
	onChainChange: (chain: PrPreviewChain) => void;
}) {
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
				onAdd={onAdd}
				onCancel={onCancel}
			/>
		</>
	);
}
