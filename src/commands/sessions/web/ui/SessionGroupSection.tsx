import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { InRepoGroupContext } from "./useInRepoGroupContext";
import { useTopBarLayoutContext } from "./useTopBarLayoutContext";

const containerSx = {
	mb: 1,
	p: 0.5,
	borderRadius: 1.5,
	border: 2,
	borderColor: "text.secondary",
	bgcolor: "background.paper",
} as const;

const headerSx = {
	display: "block",
	px: "6px",
	pt: 0.25,
	pb: 0.5,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	fontWeight: 600,
	textTransform: "uppercase",
	letterSpacing: 0.5,
} as const;

const stickyHeaderSx = {
	...headerSx,
	position: "sticky",
	top: 0,
	zIndex: 1,
	bgcolor: "background.paper",
} as const;

export function SessionGroupSection({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	const topBar = useTopBarLayoutContext();
	return (
		<Box sx={containerSx}>
			<Typography
				variant="caption"
				color="text.secondary"
				title={label}
				sx={topBar ? stickyHeaderSx : headerSx}
			>
				{label}
			</Typography>
			<InRepoGroupContext.Provider value>
				{children}
			</InRepoGroupContext.Provider>
		</Box>
	);
}
