import Box from "@mui/material/Box";
import { nextRateLimitStep } from "../../../../shared/nextRateLimitStep";
import { rateLimitLevel } from "../../../../shared/rateLimitLevel";
import { limitLevelColor } from "./limitLevelColor";

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
	const next = nextRateLimitStep(pct, resetsAt, windowSeconds, now);
	return (
		<Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
			<Box component="span" sx={{ minWidth: 18 }}>
				{label}
			</Box>
			<Box component="span" sx={{ color: limitLevelColor(level) }}>
				{Math.round(pct)}%
			</Box>
			{next.kind === "step" ? (
				<>
					<Box component="span" sx={{ opacity: 0.6 }}>
						→
					</Box>
					<Box component="span" sx={{ color: limitLevelColor(next.level) }}>
						{Math.round(next.pct)}%
					</Box>
				</>
			) : (
				<Box component="span" sx={{ opacity: 0.6 }}>
					{next.kind === "over" ? "already over" : "no projection yet"}
				</Box>
			)}
		</Box>
	);
}
