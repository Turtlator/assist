import Box from "@mui/material/Box";
import { useState } from "react";
import type { FileData, ViewType } from "react-diff-view";
import { FileDiffBody } from "./FileDiffBody";
import { FileDiffHeader } from "./FileDiffHeader";
import { isMarkdownPath } from "./isMarkdownPath";
import { MarkdownPreviewDialog } from "./MarkdownPreviewDialog";

export function fileKey(file: FileData): string {
	return `${file.oldRevision}-${file.newRevision}-${file.newPath || file.oldPath}`;
}

function filePath(file: FileData): string {
	return file.newPath && file.newPath !== "/dev/null"
		? file.newPath
		: file.oldPath;
}

export function FileDiff({
	file,
	viewType,
	cwd,
}: {
	file: FileData;
	viewType: ViewType;
	cwd: string | undefined;
}) {
	const [collapsed, setCollapsed] = useState(false);
	const [previewOpen, setPreviewOpen] = useState(false);
	const path = filePath(file);

	return (
		<Box sx={{ mb: 3 }}>
			<FileDiffHeader
				path={path}
				collapsed={collapsed}
				onToggle={() => setCollapsed((c) => !c)}
				onPreview={
					isMarkdownPath(path) ? () => setPreviewOpen(true) : undefined
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
				<FileDiffBody file={file} path={path} viewType={viewType} />
			)}
		</Box>
	);
}
