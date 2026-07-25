import type { PhaseStatus } from "../types";
import { phaseStatusStyles } from "./phaseStatusStyles";

export function phaseCardSx(status: PhaseStatus) {
	const styles = phaseStatusStyles[status];
	return {
		p: 2,
		borderColor: styles.ring ? "info.main" : styles.borderColor,
		bgcolor: styles.bgcolor,
		...(styles.ring ? { boxShadow: "0 0 0 2px" as const } : {}),
	};
}

export const markers: Record<PhaseStatus, string> = {
	done: "✓",
	current: "•",
	upcoming: "•",
};
