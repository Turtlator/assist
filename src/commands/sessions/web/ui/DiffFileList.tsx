import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { FileData, ViewType } from "react-diff-view";
import { diffSx } from "./diffSx";
import { FileDiff, fileKey } from "./FileDiff";
import type { DiffComment } from "./formatDiffComment";

export function DiffFileList({
	files,
	viewType,
	cwd,
	onComment,
}: {
	files: FileData[];
	viewType: ViewType;
	cwd: string;
	onComment?: (comment: DiffComment) => void;
}) {
	if (files.length === 0)
		return (
			<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
				No files match your filter.
			</Typography>
		);

	return (
		<Box sx={diffSx}>
			{files.map((file) => (
				<FileDiff
					key={fileKey(file)}
					file={file}
					viewType={viewType}
					cwd={cwd}
					onComment={onComment}
				/>
			))}
		</Box>
	);
}
