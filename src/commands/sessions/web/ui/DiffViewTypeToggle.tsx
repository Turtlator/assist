import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { ViewType } from "react-diff-view";

export function DiffViewTypeToggle({
	viewType,
	onChange,
}: {
	viewType: ViewType;
	onChange: (viewType: ViewType) => void;
}) {
	return (
		<ToggleButtonGroup
			size="small"
			exclusive
			value={viewType}
			onChange={(_, value) => value && onChange(value)}
		>
			<ToggleButton value="unified">Unified</ToggleButton>
			<ToggleButton value="split">Split</ToggleButton>
		</ToggleButtonGroup>
	);
}
