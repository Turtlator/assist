import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import type { DiffComment } from "./formatDiffComment";
import { SelectionCommentPopover } from "./SelectionCommentPopover";
import { useDiffSelection } from "./useDiffSelection";

export function DiffCommentLayer({
	path,
	onComment,
	children,
}: {
	path: string;
	onComment?: (comment: DiffComment) => void;
	children: ReactNode;
}) {
	const { wrapperRef, contentRef, pending, onMouseDown, clear } =
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
		<Box ref={wrapperRef} onMouseDown={onMouseDown}>
			<Box ref={contentRef}>{children}</Box>
			<SelectionCommentPopover pending={pending} onAdd={add} onCancel={clear} />
		</Box>
	);
}
