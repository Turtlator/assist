import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ViewType } from "react-diff-view";
import { CloseViewButton } from "./CloseViewButton";
import { DiffChangeTypeFilter } from "./DiffChangeTypeFilter";
import { DiffFileSearchInput } from "./DiffFileSearchInput";
import { DiffScopePicker } from "./DiffScopePicker";
import { DiffTreeToggle } from "./DiffTreeToggle";
import { DiffViewTypeToggle } from "./DiffViewTypeToggle";
import type { DiffChangeType } from "./filterDiffFiles";
import type { DiffScopeState } from "./useDiffScopeState";

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
	scope,
	onScopeChange,
	treeVisible,
	onToggleTree,
	commentHint,
}: {
	viewType: ViewType;
	onChange: (viewType: ViewType) => void;
	search: string;
	onSearchChange: (search: string) => void;
	changeType: DiffChangeType;
	onChangeTypeChange: (changeType: DiffChangeType) => void;
	scope: DiffScopeState;
	onScopeChange: (scope: string) => void;
	treeVisible: boolean;
	onToggleTree: () => void;
	commentHint?: string;
}) {
	return (
		<Box sx={toolbarSx}>
			<DiffTreeToggle treeVisible={treeVisible} onToggleTree={onToggleTree} />
			<DiffViewTypeToggle viewType={viewType} onChange={onChange} />
			<DiffScopePicker {...scope} onChange={onScopeChange} />
			<DiffChangeTypeFilter
				changeType={changeType}
				onChange={onChangeTypeChange}
			/>
			<DiffFileSearchInput search={search} onChange={onSearchChange} />
			<Box sx={{ ml: "auto" }} />
			{commentHint ? (
				<Typography variant="caption" color="text.secondary" noWrap>
					{commentHint}
				</Typography>
			) : null}
			<CloseViewButton />
		</Box>
	);
}
