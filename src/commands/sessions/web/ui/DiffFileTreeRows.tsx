import Box from "@mui/material/Box";
import type { DiffFileTreeNode } from "./buildDiffFileTree";
import { DiffFileTreeDirRow } from "./DiffFileTreeDirRow";
import { DiffFileTreeFileRow } from "./DiffFileTreeFileRow";
import { DIFF_TREE_INDENT } from "./diffFileTreeRowSx";

export function DiffFileTreeRows({
	nodes,
	depth,
	collapsed,
	activeFile,
	onToggleDir,
	onSelectFile,
	onRevert,
}: {
	nodes: DiffFileTreeNode[];
	depth: number;
	collapsed: ReadonlySet<string>;
	activeFile: string | undefined;
	onToggleDir: (path: string) => void;
	onSelectFile: (fileKey: string) => void;
	onRevert?: (path: string) => void;
}) {
	const indent = `${depth * DIFF_TREE_INDENT}px`;

	return nodes.map((node) =>
		node.kind === "file" ? (
			<DiffFileTreeFileRow
				key={node.path}
				file={node}
				indent={indent}
				active={node.fileKey === activeFile}
				onSelect={onSelectFile}
				onRevert={onRevert}
			/>
		) : (
			<Box key={node.path} sx={{ minWidth: 0 }}>
				<DiffFileTreeDirRow
					name={node.name}
					collapsed={collapsed.has(node.path)}
					indent={indent}
					onToggle={() => onToggleDir(node.path)}
				/>
				{!collapsed.has(node.path) && (
					<DiffFileTreeRows
						nodes={node.children}
						depth={depth + 1}
						collapsed={collapsed}
						activeFile={activeFile}
						onToggleDir={onToggleDir}
						onSelectFile={onSelectFile}
						onRevert={onRevert}
					/>
				)}
			</Box>
		),
	);
}
