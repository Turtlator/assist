import { Box, Divider } from "@mui/material";
import type { PrPreview } from "../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "./PrDecisionDetails";
import { PrPreviewContent } from "./PrPreviewContent";
import { PrPreviewFooter } from "./PrPreviewFooter";
import { PrPreviewHeader } from "./PrPreviewHeader";
import { usePrPane } from "./usePrPane";

const paneSx = {
	flex: 1,
	minWidth: 0,
	height: "100%",
	display: "flex",
	flexDirection: "column",
	borderLeft: 1,
	borderColor: "divider",
	bgcolor: "background.paper",
} as const;

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
	const isPr = preview.kind !== "backlog-item";
	const newPr = isPr && preview.prNumber === null;
	const pane = usePrPane(
		preview.requestId,
		sessionId,
		cwd,
		onDecision,
		isPr,
		preview.draft === true,
	);

	return (
		<Box sx={paneSx} onDrop={pane.onDrop} onDragOver={pane.onDragOver}>
			<PrPreviewHeader preview={preview} />
			<Divider />
			<PrPreviewContent body={preview.body} pane={pane} screenshots={isPr} />
			<PrPreviewFooter
				comments={pane.comments}
				commentColors={pane.commentColors}
				pending={pane.pending}
				onRemove={pane.remove}
				onDecision={pane.onDecide}
				onAdd={pane.onAdd}
				onCancel={pane.onCancel}
				chain={isPr ? pane.chain : undefined}
				newPr={newPr}
				onChainChange={pane.setChain}
			/>
		</Box>
	);
}
