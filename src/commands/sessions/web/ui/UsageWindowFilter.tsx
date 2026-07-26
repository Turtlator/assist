import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { UsagePeakWindow } from "../../../../shared/db/listUsagePeaks";
import { usagePeakWindow } from "./usagePeakWindow";

export type UsageWindowFilterValue = UsagePeakWindow | "all";

const options: { value: UsageWindowFilterValue; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "five_hour", label: usagePeakWindow.five_hour.label },
	{ value: "seven_day", label: usagePeakWindow.seven_day.label },
];

export function UsageWindowFilter({
	window,
	onChange,
}: {
	window: UsageWindowFilterValue;
	onChange: (window: UsageWindowFilterValue) => void;
}) {
	return (
		<ToggleButtonGroup
			size="small"
			exclusive
			value={window}
			onChange={(_, value) => value && onChange(value)}
			aria-label="Filter peaks by rate-limit window"
		>
			{options.map((option) => (
				<ToggleButton key={option.value} value={option.value}>
					{option.label}
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
