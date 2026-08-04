import Box from "@mui/material/Box";
import { nextRateLimitStep } from "../../../../shared/nextRateLimitStep";
import {
	formatRateLimitTimeLeft,
	type RateLimitLevel,
} from "../../../../shared/rateLimitLevel";
import { limitLevelColor } from "./limitLevelColor";

function Threshold({
	arrow,
	level,
	pct,
}: {
	arrow: string;
	level: RateLimitLevel;
	pct: number;
}) {
	return (
		<>
			<Box component="span" sx={{ opacity: 0.6 }}>
				{arrow}
			</Box>
			<Box component="span" sx={{ color: limitLevelColor(level) }}>
				{Math.round(pct)}%
			</Box>
		</>
	);
}

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
	const { recovery, worse } = next;
	return (
		<>
			{recovery ? (
				<Threshold arrow="←" level={recovery.level} pct={recovery.pct} />
			) : null}
			{worse ? (
				<Threshold arrow="→" level={worse.level} pct={worse.pct} />
			) : null}
			{recovery ? (
				<Box component="span" sx={{ opacity: 0.6 }}>
					{recovery.at == null
						? "not before reset"
						: `${recovery.level === "ok" ? "green" : "under"} in ${formatRateLimitTimeLeft(recovery.at, now)}`}
				</Box>
			) : null}
		</>
	);
}
