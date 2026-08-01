import Box from "@mui/material/Box";
import { DiffFileList, type DiffFileListProps } from "./DiffFileList";
import { DiffFileTree } from "./DiffFileTree";
import { scrollToDiffFile } from "./scrollToDiffFile";

const columnsSx = { display: "flex", alignItems: "flex-start" } as const;

export type DiffViewBodyProps = DiffFileListProps & {
	treeVisible: boolean;
	activeFile?: string;
	onRevert?: (path: string) => void;
};

export function DiffViewBody({
	treeVisible,
	activeFile,
	onRevert,
	...list
}: DiffViewBodyProps) {
	const onSelectFile = (fileKey: string) => {
		if (list.isCollapsed(fileKey)) list.onToggleCollapsed(fileKey);
		scrollToDiffFile(fileKey);
	};

	return (
		<Box sx={columnsSx}>
			{treeVisible && (
				<DiffFileTree
					files={list.files}
					activeFile={activeFile}
					onSelectFile={onSelectFile}
					onRevert={onRevert}
				/>
			)}
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<DiffFileList {...list} />
			</Box>
		</Box>
	);
}
