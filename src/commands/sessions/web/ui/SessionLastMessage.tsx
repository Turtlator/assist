import Box from "@mui/material/Box";
import { useRef, useState } from "react";
import { useDismissablePin } from "./useDismissablePin";

const baseSx = {
	position: "absolute",
	top: "100%",
	right: 0,
	width: { xs: "60%", md: "33%" },
	px: 2,
	py: 1.25,
	bgcolor: "background.paper",
	color: "text.secondary",
	borderLeft: 1,
	borderBottom: 1,
	borderColor: "divider",
	borderBottomLeftRadius: 1,
	fontSize: "0.875rem",
	lineHeight: 1.4,
} as const;

const collapsedSx = {
	...baseSx,
	zIndex: 2,
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
	userSelect: "none",
	cursor: "pointer",
} as const;

const expandedSx = {
	...collapsedSx,
	zIndex: 3,
	whiteSpace: "pre-wrap",
	overflowWrap: "anywhere",
	overflow: "hidden auto",
	textOverflow: "clip",
	maxHeight: "50vh",
	boxShadow: 4,
} as const;

const pinnedSx = {
	...expandedSx,
	userSelect: "text",
	cursor: "auto",
} as const;

export function SessionLastMessage({ message }: { message?: string }) {
	const [hovered, setHovered] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const { pinned, pin } = useDismissablePin(ref);

	const oneLine = message?.replace(/\s+/g, " ").trim();
	if (!oneLine) return null;

	const expanded = hovered || pinned;

	return (
		<Box
			ref={ref}
			sx={pinned ? pinnedSx : expanded ? expandedSx : collapsedSx}
			data-testid="session-last-message"
			data-expanded={expanded ? "true" : "false"}
			data-pinned={pinned ? "true" : "false"}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={pin}
		>
			{expanded ? message?.trim() : oneLine}
		</Box>
	);
}
