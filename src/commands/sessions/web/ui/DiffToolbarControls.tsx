import type { ViewType } from "react-diff-view";
import { DiffChangeTypeMenu } from "./DiffChangeTypeMenu";
import { DiffFileSearch } from "./DiffFileSearch";
import { DiffViewTypeToggle } from "./DiffViewTypeToggle";
import type { DiffChangeType } from "./filterDiffFiles";

export type DiffToolbarControlProps = {
	search: string;
	onSearchChange: (search: string) => void;
	changeType: DiffChangeType;
	onChangeTypeChange: (changeType: DiffChangeType) => void;
	viewType: ViewType;
	onChange: (viewType: ViewType) => void;
};

export function DiffToolbarControls({
	search,
	onSearchChange,
	changeType,
	onChangeTypeChange,
	viewType,
	onChange,
}: DiffToolbarControlProps) {
	return (
		<>
			<DiffFileSearch search={search} onChange={onSearchChange} />
			<DiffChangeTypeMenu
				changeType={changeType}
				onChange={onChangeTypeChange}
			/>
			<DiffViewTypeToggle viewType={viewType} onChange={onChange} />
		</>
	);
}
