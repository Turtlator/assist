import { Box, Popover, Typography } from "@mui/material";
import { CommentNoteForm } from "./CommentNoteForm";
import { QuoteBlock } from "./QuoteBlock";

export type SelectionAnchor = {
	quote: string;
	top: number;
	left: number;
};

const boxSx = {
	p: 1.5,
	width: 340,
	display: "flex",
	flexDirection: "column",
	gap: 1,
} as const;

export function SelectionCommentPopover({
	pending,
	moved,
	editable,
	onAdd,
	onCancel,
	onCollapse,
}: {
	pending: SelectionAnchor | null;
	moved?: boolean;
	editable?: boolean;
	onAdd: (note: string) => void;
	onCancel: () => void;
	onCollapse?: () => void;
}) {
	const draftKey = pending?.quote ?? "";

	return (
		<Popover
			open={pending !== null}
			onClose={onCancel}
			anchorReference="anchorPosition"
			anchorPosition={
				pending ? { top: pending.top, left: pending.left } : undefined
			}
			transformOrigin={{ vertical: "top", horizontal: "left" }}
		>
			<Box sx={boxSx}>
				{moved && (
					<Typography variant="caption" color="warning.main">
						These lines changed since you selected them — your comment still
						quotes the text below.
					</Typography>
				)}
				<QuoteBlock text={draftKey} />
				<CommentNoteForm
					key={draftKey}
					onAdd={onAdd}
					onCancel={onCancel}
					onCollapse={editable ? onCollapse : undefined}
				/>
			</Box>
		</Popover>
	);
}
