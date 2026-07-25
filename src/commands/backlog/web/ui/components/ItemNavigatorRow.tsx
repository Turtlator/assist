import { ButtonBase } from "@mui/material";
import type { ItemNavSection } from "./itemNavSections";
import { itemNavigatorRowSx } from "./itemNavigatorRowSx";

type ItemNavigatorRowProps = {
	section: ItemNavSection;
	active: boolean;
	onSelect: (id: string) => void;
};

export function ItemNavigatorRow({
	section,
	active,
	onSelect,
}: ItemNavigatorRowProps) {
	return (
		<ButtonBase
			sx={itemNavigatorRowSx(section, active)}
			onClick={() => onSelect(section.id)}
			title={section.title ?? section.label}
			aria-current={active ? "true" : undefined}
		>
			{section.label}
		</ButtonBase>
	);
}
