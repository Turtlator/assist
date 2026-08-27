import { Box, Popover } from "@mui/material";
import {
	SelectionCommentBody,
	type SelectionCommentBodyProps,
} from "./SelectionCommentBody";

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
	...body
}: SelectionCommentBodyProps & { pending: SelectionAnchor | null }) {
	return (
		<Popover
			open={pending !== null}
			onClose={body.onCancel}
			anchorReference="anchorPosition"
			anchorPosition={
				pending ? { top: pending.top, left: pending.left } : undefined
			}
			transformOrigin={{ vertical: "top", horizontal: "left" }}
		>
			<Box sx={boxSx}>
				<SelectionCommentBody
					{...body}
					quote={pending?.quote ?? ""}
					open={pending !== null}
				/>
			</Box>
		</Popover>
	);
}
