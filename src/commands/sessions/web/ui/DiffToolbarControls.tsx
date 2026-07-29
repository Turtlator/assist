import type { ViewType } from "react-diff-view";
import { DiffChangeTypeMenu } from "./DiffChangeTypeMenu";
import { DiffFileSearch } from "./DiffFileSearch";
import { DiffTreeToggle } from "./DiffTreeToggle";
import { DiffViewTypeToggle } from "./DiffViewTypeToggle";
import type { DiffChangeType } from "./filterDiffFiles";

export type DiffToolbarControlProps = {
	search: string;
	onSearchChange: (search: string) => void;
	changeType: DiffChangeType;
	onChangeTypeChange: (changeType: DiffChangeType) => void;
	viewType: ViewType;
	onChange: (viewType: ViewType) => void;
	treeVisible: boolean;
	onToggleTree: () => void;
};

export function DiffToolbarControls({
	search,
	onSearchChange,
	changeType,
	onChangeTypeChange,
	viewType,
	onChange,
	treeVisible,
	onToggleTree,
}: DiffToolbarControlProps) {
	return (
		<>
			<DiffFileSearch search={search} onChange={onSearchChange} />
			<DiffChangeTypeMenu
				changeType={changeType}
				onChange={onChangeTypeChange}
			/>
			<DiffTreeToggle treeVisible={treeVisible} onToggleTree={onToggleTree} />
			<DiffViewTypeToggle viewType={viewType} onChange={onChange} />
		</>
	);
}
