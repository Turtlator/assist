import { Box, Divider } from "@mui/material";
import type { PrPreview } from "../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "./PrDecisionDetails";
import { PrPreviewContent } from "./PrPreviewContent";
import { PrPreviewFooter } from "./PrPreviewFooter";
import { PrPreviewHeader } from "./PrPreviewHeader";
import { prPreviewPaneSx } from "./prPreviewPaneSx";
import { usePrPane } from "./usePrPane";

export function PrPreviewPane({
	preview,
	sessionId,
	cwd,
	onDecision,
}: {
	preview: PrPreview;
	sessionId?: string;
	cwd?: string;
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
}) {
	const isPr = (preview.kind ?? "pr") === "pr";
	const editable = preview.kind === "github-issue-edit";
	const newPr = isPr && preview.prNumber === null;
	const pane = usePrPane({
		requestId: preview.requestId,
		sessionId,
		cwd,
		onDecision,
		isPr,
		resolvedDraft: preview.draft === true,
		initialBody: preview.body,
		editable,
	});

	return (
		<Box sx={prPreviewPaneSx} onDrop={pane.onDrop} onDragOver={pane.onDragOver}>
			<PrPreviewHeader preview={preview} draft={pane.chain.draft} />
			<Divider />
			<PrPreviewContent pane={pane} screenshots={isPr} />
			<PrPreviewFooter
				comments={pane.comments}
				commentColors={pane.commentColors}
				pending={pane.pending}
				onRemove={pane.remove}
				onDecision={pane.onDecide}
				onAdd={pane.onAdd}
				onCancel={pane.onCancel}
				onCollapse={pane.onCollapse}
				chain={isPr ? pane.chain : undefined}
				editable={editable}
				newPr={newPr}
				onChainChange={pane.setChain}
			/>
		</Box>
	);
}
