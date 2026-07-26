import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { areChipsLoading } from "./areChipsLoading";
import { CardActionButtons } from "./CardActionButtons";
import { CardChips } from "./CardChips";
import { CardInlineStatus } from "./CardInlineStatus";
import { displayStatus } from "./displayStatus";
import { SessionStatusDot } from "./SessionStatusDot";
import type { CardHeaderProps } from "./types";
import { useTopBarLayoutContext } from "./useTopBarLayoutContext";

export function CardHeaderActions({
	session,
	loading,
	onRetry,
	onRestart,
	onDismiss,
}: CardHeaderProps) {
	const topBar = useTopBarLayoutContext();
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 1,
				...(topBar ? { flexWrap: "wrap", rowGap: 0.5 } : {}),
			}}
		>
			{topBar && !loading && (
				<SessionStatusDot status={displayStatus(session)} />
			)}
			{areChipsLoading(session, loading) ? (
				<>
					<CircularProgress size={12} />
					{loading && (
						<Typography variant="caption" color="text.disabled">
							{session.closing ? "Closing…" : "Starting…"}
						</Typography>
					)}
				</>
			) : (
				<CardChips session={session} />
			)}
			<Box sx={{ flex: 1 }} />
			{topBar && !loading && <CardInlineStatus session={session} />}
			<CardActionButtons
				session={session}
				loading={loading}
				onRetry={onRetry}
				onRestart={onRestart}
				onDismiss={onDismiss}
			/>
		</Box>
	);
}
