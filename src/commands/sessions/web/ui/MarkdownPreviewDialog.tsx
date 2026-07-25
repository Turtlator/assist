import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import { MarkdownBlock } from "../../../backlog/web/ui/components/MarkdownBlock";
import { useFileContent } from "./useFileContent";

export function MarkdownPreviewDialog({
	cwd,
	path,
	onClose,
}: {
	cwd: string | undefined;
	path: string;
	onClose: () => void;
}) {
	const state = useFileContent(cwd, path);

	return (
		<Dialog open onClose={onClose} maxWidth="lg" fullWidth>
			<DialogTitle sx={{ fontFamily: "monospace", fontSize: "1rem" }}>
				{path}
			</DialogTitle>
			<DialogContent dividers>
				{state.status === "loading" && (
					<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
						<CircularProgress size={24} />
					</Box>
				)}
				{state.status === "absent" && (
					<Alert severity="info">
						This file is no longer in the working tree.
					</Alert>
				)}
				{state.status === "too-large" && (
					<Alert severity="info">
						This file is too large to display (over 2 MB).
					</Alert>
				)}
				{state.status === "error" && (
					<Alert severity="error">Couldn't load this file.</Alert>
				)}
				{state.status === "ready" && (
					<MarkdownBlock content={state.content} renderMermaid wide />
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}
