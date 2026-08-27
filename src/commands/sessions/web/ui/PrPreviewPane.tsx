import { Box, Divider } from "@mui/material";
import { PrPreviewContent } from "./PrPreviewContent";
import { PrPreviewFooter } from "./PrPreviewFooter";
import { PrPreviewHeader } from "./PrPreviewHeader";
import type { PrPreviewPaneProps } from "./PrPreviewPaneProps";
import { previewFooterProps } from "./previewFooterProps";
import { previewRuleAdder } from "./previewRuleAdder";
import { previewRuleCiter } from "./previewRuleCiter";
import { prPreviewPaneSx } from "./prPreviewPaneSx";
import { usePrPane } from "./usePrPane";

export function PrPreviewPane({
	preview,
	sessionId,
	cwd,
	sendInput,
	onDecision,
}: PrPreviewPaneProps) {
	const isPr = (preview.kind ?? "pr") === "pr";
	const editable = preview.kind === "github-issue-edit";
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
				{...previewFooterProps({
					preview,
					pane,
					cwd,
					isPr,
					editable,
					onCite: previewRuleCiter(
						sessionId,
						sendInput,
						pane.pending?.quote,
						pane.onCancel,
					),
					onAddRule: previewRuleAdder(
						sessionId,
						sendInput,
						pane.pending?.quote,
						pane.onCancel,
					),
				})}
			/>
		</Box>
	);
}
