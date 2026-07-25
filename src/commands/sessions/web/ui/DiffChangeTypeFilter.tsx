import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { DiffChangeType } from "./filterDiffFiles";

const options: { value: DiffChangeType; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "modified", label: "Modified" },
	{ value: "added", label: "Added" },
	{ value: "removed", label: "Removed" },
	{ value: "renamed", label: "Renamed" },
];

export function DiffChangeTypeFilter({
	changeType,
	onChange,
}: {
	changeType: DiffChangeType;
	onChange: (changeType: DiffChangeType) => void;
}) {
	return (
		<ToggleButtonGroup
			size="small"
			exclusive
			value={changeType}
			onChange={(_, value) => value && onChange(value)}
			aria-label="Filter files by change type"
		>
			{options.map((option) => (
				<ToggleButton key={option.value} value={option.value}>
					{option.label}
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
