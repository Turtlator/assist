import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import { marked } from "marked";

export function ReviewSynthesisDialog({
	content,
	onClose,
}: {
	content: string;
	onClose: () => void;
}) {
	return (
		<Dialog open onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>Review synthesis</DialogTitle>
			<DialogContent dividers>
				<Box
					className="markdown"
					sx={{
						lineHeight: 1.7,
						"& p": { mt: 0 },
						"& a": { color: "primary.main" },
						wordBreak: "break-word",
					}}
					dangerouslySetInnerHTML={{
						__html: marked.parse(content) as string,
					}}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}
