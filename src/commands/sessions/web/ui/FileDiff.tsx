import Box from "@mui/material/Box";
import { useState } from "react";
import type { FileData } from "react-diff-view";
import { DiffCommentLayer } from "./DiffCommentLayer";
import { diffFileDomId } from "./diffFileDomId";
import { FileDiffBody } from "./FileDiffBody";
import { FileDiffHeader } from "./FileDiffHeader";
import type { FileDiffProps } from "./FileDiffProps";
import { isMarkdownPath } from "./isMarkdownPath";
import { MarkdownPreviewDialog } from "./MarkdownPreviewDialog";

export function filePath(file: FileData): string {
	return file.newPath && file.newPath !== "/dev/null"
		? file.newPath
		: file.oldPath;
}

export function FileDiff({
	file,
	viewType,
	cwd,
	collapsed,
	onToggle,
	onComment,
	onAddRule,
}: FileDiffProps) {
	const [previewOpen, setPreviewOpen] = useState(false);
	const path = filePath(file);

	return (
		<Box id={diffFileDomId(path)} sx={{ mb: 3 }}>
			<FileDiffHeader
				path={path}
				collapsed={collapsed}
				onToggle={onToggle}
				onPreview={
					isMarkdownPath(path) && file.type !== "delete"
						? () => setPreviewOpen(true)
						: undefined
				}
			/>
			{previewOpen && (
				<MarkdownPreviewDialog
					cwd={cwd}
					path={path}
					onClose={() => setPreviewOpen(false)}
				/>
			)}
			{!collapsed && (
				<DiffCommentLayer
					path={path}
					cwd={cwd}
					hunks={file.hunks}
					onComment={onComment}
					onAddRule={onAddRule}
				>
					<FileDiffBody file={file} path={path} viewType={viewType} />
				</DiffCommentLayer>
			)}
		</Box>
	);
}
