import AddIcon from "@mui/icons-material/Add";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import { Box, Button } from "@mui/material";

const labels = {
	insert: "Add acceptance criteria",
	convert: "Convert to outline",
} as const;

export function CriteriaSectionButton({
	kind,
	onClick,
}: {
	kind: "insert" | "convert";
	onClick: () => void;
}) {
	return (
		<Box sx={{ my: 1 }} data-preview-skip>
			<Button
				size="small"
				variant="outlined"
				startIcon={kind === "insert" ? <AddIcon /> : <FormatListNumberedIcon />}
				onClick={onClick}
			>
				{labels[kind]}
			</Button>
		</Box>
	);
}
