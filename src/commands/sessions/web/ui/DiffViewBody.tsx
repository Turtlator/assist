import Box from "@mui/material/Box";
import type { FileData, ViewType } from "react-diff-view";
import { DiffFileList } from "./DiffFileList";
import { DiffFileTree } from "./DiffFileTree";
import type { DiffComment } from "./formatDiffComment";
import { scrollToDiffFile } from "./scrollToDiffFile";

const columnsSx = { display: "flex", alignItems: "flex-start" } as const;

export type DiffViewBodyProps = {
	files: FileData[];
	treeVisible: boolean;
	viewType: ViewType;
	cwd: string;
	isCollapsed: (path: string) => boolean;
	onToggleCollapsed: (path: string) => void;
	onComment?: (comment: DiffComment) => void;
	emptyMessage: string;
};

export function DiffViewBody({
	files,
	treeVisible,
	viewType,
	cwd,
	isCollapsed,
	onToggleCollapsed,
	onComment,
	emptyMessage,
}: DiffViewBodyProps) {
	return (
		<Box sx={columnsSx}>
			{treeVisible && (
				<DiffFileTree files={files} onSelectFile={scrollToDiffFile} />
			)}
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<DiffFileList
					files={files}
					viewType={viewType}
					cwd={cwd}
					isCollapsed={isCollapsed}
					onToggleCollapsed={onToggleCollapsed}
					onComment={onComment}
					emptyMessage={emptyMessage}
				/>
			</Box>
		</Box>
	);
}
