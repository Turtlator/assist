import { ButtonBase, Typography } from "@mui/material";
import type { ItemNavSection } from "./itemNavSections";
import { phaseStatusStyles } from "./phaseStatusStyles";

const baseRowSx = {
	justifyContent: "flex-start",
	width: "100%",
	pr: 1,
	py: 0.25,
	borderRadius: 1,
	textAlign: "left",
} as const;

const baseLabelSx = {
	fontSize: "0.7rem",
	letterSpacing: "0.04em",
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
} as const;

type ItemNavigatorRowProps = {
	section: ItemNavSection;
	onSelect: (id: string) => void;
};

export function ItemNavigatorRow({ section, onSelect }: ItemNavigatorRowProps) {
	const tint = section.status && phaseStatusStyles[section.status];
	return (
		<ButtonBase
			sx={{
				...baseRowSx,
				pl: section.nested ? 2 : 1,
				...(tint ? { bgcolor: tint.bgcolor } : {}),
				"&:hover": { bgcolor: "action.hover" },
			}}
			onClick={() => onSelect(section.id)}
		>
			<Typography
				sx={{
					...baseLabelSx,
					color: section.status ? "text.primary" : "text.secondary",
				}}
				title={section.label}
			>
				{section.label}
			</Typography>
		</ButtonBase>
	);
}
