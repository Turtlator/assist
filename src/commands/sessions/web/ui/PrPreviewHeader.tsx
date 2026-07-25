import { Box, Chip, Typography } from "@mui/material";
import type { PrPreview } from "../../shared/SessionInfoBase";
import { previewChip } from "./previewChip";

export function PrPreviewHeader({ preview }: { preview: PrPreview }) {
	const chip = previewChip(preview);
	return (
		<Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
			<Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
				{preview.title}
			</Typography>
			<Chip size="small" label={chip.label} color={chip.color} />
		</Box>
	);
}
