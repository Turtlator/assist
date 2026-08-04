import Box from "@mui/material/Box";
import type { RateLimitLevel } from "../../../../shared/rateLimitLevel";
import { limitLevelColor } from "./limitLevelColor";

export function RateLimitThresholdSlot({
	arrow,
	threshold,
}: {
	arrow: string;
	threshold: { level: RateLimitLevel; pct: number } | undefined;
}) {
	return (
		<Box
			component="span"
			sx={{ display: "inline-flex", gap: 0.5, minWidth: "6ch" }}
		>
			{threshold ? (
				<>
					<Box component="span" sx={{ opacity: 0.6 }}>
						{arrow}
					</Box>
					<Box
						component="span"
						sx={{ color: limitLevelColor(threshold.level) }}
					>
						{Math.round(threshold.pct)}%
					</Box>
				</>
			) : null}
		</Box>
	);
}
