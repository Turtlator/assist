import Box from "@mui/material/Box";
import { rateLimitLevel } from "../../../../shared/rateLimitLevel";
import { limitLevelColor } from "./limitLevelColor";
import { RateLimitTooltipProjection } from "./RateLimitTooltipProjection";

export function RateLimitTooltipRow({
	label,
	pct,
	resetsAt,
	windowSeconds,
	now,
}: {
	label: string;
	pct: number;
	resetsAt: number | undefined;
	windowSeconds: number;
	now: number;
}) {
	const level = rateLimitLevel(pct, resetsAt, windowSeconds, now);
	return (
		<Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
			<Box component="span" sx={{ minWidth: 18 }}>
				{label}
			</Box>
			<Box component="span" sx={{ color: limitLevelColor(level) }}>
				{Math.round(pct)}%
			</Box>
			<RateLimitTooltipProjection
				pct={pct}
				resetsAt={resetsAt}
				windowSeconds={windowSeconds}
				now={now}
			/>
		</Box>
	);
}
