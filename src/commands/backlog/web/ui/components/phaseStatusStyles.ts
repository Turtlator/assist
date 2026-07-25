import type { PhaseStatus } from "../types";

export const phaseStatusStyles: Record<
	PhaseStatus,
	{ borderColor: string; bgcolor: string; ring?: string }
> = {
	done: { borderColor: "success.light", bgcolor: "success.light" },
	current: {
		borderColor: "info.main",
		bgcolor: "info.light",
		ring: "info.light",
	},
	upcoming: { borderColor: "divider", bgcolor: "background.paper" },
};
