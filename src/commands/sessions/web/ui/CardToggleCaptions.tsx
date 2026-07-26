import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SessionToggle } from "./sessionToggles";

export function CardToggleCaptions({ toggles }: { toggles: SessionToggle[] }) {
	const captions = toggles.flatMap((t) => t.caption ?? []);
	if (captions.length === 0) return null;

	return (
		<Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
			{captions.map((caption) => (
				<Typography key={caption} variant="caption" color="text.disabled">
					{caption}
				</Typography>
			))}
		</Box>
	);
}
