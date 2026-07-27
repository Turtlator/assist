import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { commentColor } from "./commentColor";
import { DragOverlay } from "./DragOverlay";
import type { DiffComment } from "./formatDiffComment";
import { SelectionCommentPopover } from "./SelectionCommentPopover";
import { useDiffSelection } from "./useDiffSelection";

const wrapperSx = {
	position: "relative",
	userSelect: "none",
	cursor: "text",
} as const;

export function DiffCommentLayer({
	path,
	onComment,
	children,
}: {
	path: string;
	onComment?: (comment: DiffComment) => void;
	children: ReactNode;
}) {
	const { wrapperRef, contentRef, pending, rects, onMouseDown, clear } =
		useDiffSelection();

	if (!onComment) return <>{children}</>;

	const add = (note: string) => {
		if (pending)
			onComment({
				path,
				startLine: pending.startLine,
				endLine: pending.endLine,
				quote: pending.quote,
				note,
			});
		clear();
	};

	return (
		<Box ref={wrapperRef} onMouseDown={onMouseDown} sx={wrapperSx}>
			<Box ref={contentRef}>{children}</Box>
			<DragOverlay rects={rects} color={commentColor(0).fill} />
			<SelectionCommentPopover pending={pending} onAdd={add} onCancel={clear} />
		</Box>
	);
}
