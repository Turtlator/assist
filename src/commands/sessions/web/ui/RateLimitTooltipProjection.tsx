import Box from "@mui/material/Box";
import { nextRateLimitStep } from "../../../../shared/nextRateLimitStep";
import { formatRateLimitTimeLeft } from "../../../../shared/rateLimitLevel";
import { limitLevelColor } from "./limitLevelColor";

export function RateLimitTooltipProjection({
	pct,
	resetsAt,
	windowSeconds,
	now,
}: {
	pct: number;
	resetsAt: number | undefined;
	windowSeconds: number;
	now: number;
}) {
	const next = nextRateLimitStep(pct, resetsAt, windowSeconds, now);
	if (next.kind === "unprojectable")
		return (
			<Box component="span" sx={{ opacity: 0.6 }}>
				no projection yet
			</Box>
		);
	return (
		<>
			<Box component="span" sx={{ opacity: 0.6 }}>
				{next.kind === "over" ? "←" : "→"}
			</Box>
			<Box
				component="span"
				sx={{
					color: limitLevelColor(next.kind === "over" ? "warn" : next.level),
				}}
			>
				{Math.round(next.pct)}%
			</Box>
			{next.kind === "over" ? (
				<Box component="span" sx={{ opacity: 0.6 }}>
					{next.recoversAt == null
						? "not before reset"
						: `under in ${formatRateLimitTimeLeft(next.recoversAt, now)}`}
				</Box>
			) : null}
		</>
	);
}
