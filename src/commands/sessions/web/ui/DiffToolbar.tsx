import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { ViewType } from "react-diff-view";
import { CloseViewButton } from "./CloseViewButton";
import { DiffChangeTypeFilter } from "./DiffChangeTypeFilter";
import { DiffFileSearchInput } from "./DiffFileSearchInput";
import type { DiffChangeType } from "./filterDiffFiles";

export const DIFF_TOOLBAR_HEIGHT = 40;

const toolbarSx = {
	position: "sticky",
	top: 0,
	zIndex: 2,
	height: DIFF_TOOLBAR_HEIGHT,
	display: "flex",
	alignItems: "center",
	gap: 1,
	bgcolor: "background.default",
	borderBottom: 1,
	borderColor: "divider",
} as const;

export function DiffToolbar({
	viewType,
	onChange,
	search,
	onSearchChange,
	changeType,
	onChangeTypeChange,
}: {
	viewType: ViewType;
	onChange: (viewType: ViewType) => void;
	search: string;
	onSearchChange: (search: string) => void;
	changeType: DiffChangeType;
	onChangeTypeChange: (changeType: DiffChangeType) => void;
}) {
	return (
		<Box sx={toolbarSx}>
			<ToggleButtonGroup
				size="small"
				exclusive
				value={viewType}
				onChange={(_, value) => value && onChange(value)}
			>
				<ToggleButton value="unified">Unified</ToggleButton>
				<ToggleButton value="split">Split</ToggleButton>
			</ToggleButtonGroup>
			<DiffChangeTypeFilter
				changeType={changeType}
				onChange={onChangeTypeChange}
			/>
			<DiffFileSearchInput search={search} onChange={onSearchChange} />
			<CloseViewButton sx={{ ml: "auto" }} />
		</Box>
	);
}
