import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CardHeaderActions } from "./CardHeaderActions";
import { sessionPhaseCaption } from "./sessionPhaseCaption";
import { sessionTitle } from "./sessionTitle";
import type { CardHeaderProps } from "./types";
import { useTopBarLayoutContext } from "./useTopBarLayoutContext";

export function CardHeader({
	session,
	loading,
	onRetry,
	onRestart,
	onDismiss,
}: CardHeaderProps) {
	const topBar = useTopBarLayoutContext();
	const caption = topBar ? undefined : sessionPhaseCaption(session);
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
			<CardHeaderActions
				session={session}
				loading={loading}
				onRetry={onRetry}
				onRestart={onRestart}
				onDismiss={onDismiss}
			/>
			<Typography
				variant="body2"
				sx={{
					color: "text.primary",
					overflowWrap: "anywhere",
					display: "-webkit-box",
					WebkitBoxOrient: "vertical",
					WebkitLineClamp: 5,
					overflow: "hidden",
				}}
			>
				{sessionTitle(session)}
			</Typography>
			{caption && (
				<Typography
					variant="caption"
					sx={{ color: "text.secondary", overflowWrap: "anywhere" }}
				>
					{caption}
				</Typography>
			)}
		</Box>
	);
}
