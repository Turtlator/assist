import Box from "@mui/material/Box";
import { useMemo, useState } from "react";
import type { FileData } from "react-diff-view";
import { buildDiffFileTree } from "./buildDiffFileTree";
import { DiffFileTreeRows } from "./DiffFileTreeRows";
import { DIFF_TOOLBAR_HEIGHT } from "./DiffToolbar";

const panelSx = {
	position: "sticky",
	top: `${DIFF_TOOLBAR_HEIGHT}px`,
	alignSelf: "flex-start",
	flexShrink: 0,
	width: 260,
	maxHeight: `calc(100vh - ${DIFF_TOOLBAR_HEIGHT + 96}px)`,
	overflow: "auto",
	pt: 2,
	pr: 1,
} as const;

export function DiffFileTree({
	files,
	onSelectFile,
}: {
	files: FileData[];
	onSelectFile: (fileKey: string) => void;
}) {
	const nodes = useMemo(() => buildDiffFileTree(files), [files]);
	const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

	const onToggleDir = (path: string) =>
		setCollapsed((prev) => {
			const next = new Set(prev);
			if (!next.delete(path)) next.add(path);
			return next;
		});

	if (nodes.length === 0) return null;

	return (
		<Box sx={panelSx} aria-label="Changed files">
			<DiffFileTreeRows
				nodes={nodes}
				depth={0}
				collapsed={collapsed}
				onToggleDir={onToggleDir}
				onSelectFile={onSelectFile}
			/>
		</Box>
	);
}
