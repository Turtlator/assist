import Box from "@mui/material/Box";
import { type ReactNode, useMemo } from "react";
import type { HunkData } from "react-diff-view";
import { buildChangeIndex } from "./buildChangeIndex";
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
	hunks,
	onComment,
	children,
}: {
	path: string;
	hunks: HunkData[];
	onComment?: (comment: DiffComment) => void;
	children: ReactNode;
}) {
	const index = useMemo(() => buildChangeIndex(hunks), [hunks]);
	const { wrapperRef, contentRef, pending, rects, onMouseDown, clear } =
		useDiffSelection(index);

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
