import Box from "@mui/material/Box";
import { useEffect, useMemo, useState } from "react";
import type { FileData } from "react-diff-view";
import { buildDiffFileTree } from "./buildDiffFileTree";
import { DiffFileTreeRows } from "./DiffFileTreeRows";
import { DIFF_TOOLBAR_HEIGHT } from "./DiffToolbar";
import { expandAncestors } from "./expandAncestors";

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
	activeFile,
	onSelectFile,
}: {
	files: FileData[];
	activeFile?: string;
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

	useEffect(() => {
		if (activeFile) setCollapsed((prev) => expandAncestors(prev, activeFile));
	}, [activeFile]);

	if (nodes.length === 0) return null;

	return (
		<Box sx={panelSx} aria-label="Changed files">
			<DiffFileTreeRows
				nodes={nodes}
				depth={0}
				collapsed={collapsed}
				activeFile={activeFile}
				onToggleDir={onToggleDir}
				onSelectFile={onSelectFile}
			/>
		</Box>
	);
}
