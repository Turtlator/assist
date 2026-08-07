import Box from "@mui/material/Box";

const readoutSx = {
	position: "absolute",
	top: "100%",
	right: 0,
	zIndex: 2,
	width: { xs: "60%", md: "33%" },
	px: 1,
	py: 0.5,
	bgcolor: "background.paper",
	color: "text.secondary",
	borderLeft: 1,
	borderBottom: 1,
	borderColor: "divider",
	borderBottomLeftRadius: 1,
	fontSize: "0.75rem",
	lineHeight: 1.4,
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
} as const;

export function SessionLastMessage({ message }: { message?: string }) {
	const text = message?.replace(/\s+/g, " ").trim();
	if (!text) return null;

	return (
		<Box sx={readoutSx} data-testid="session-last-message">
			{text}
		</Box>
	);
}
