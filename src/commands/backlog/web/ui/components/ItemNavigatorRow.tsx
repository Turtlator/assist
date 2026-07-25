import { Box, ButtonBase, Typography } from "@mui/material";
import type { ItemNavSection } from "./itemNavSections";
import { phaseStatusStyles } from "./phaseStatusStyles";

const FONT_SIZE = "1.75rem";

const baseRowSx = {
	justifyContent: "flex-start",
	width: "100%",
	pr: 1,
	py: 0.25,
	borderRadius: 1,
	textAlign: "left",
	"&:hover": { bgcolor: "action.hover" },
} as const;

const labelSx = {
	fontSize: FONT_SIZE,
	letterSpacing: "0.02em",
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
	color: "text.secondary",
} as const;

const circleSx = {
	fontSize: FONT_SIZE,
	width: "2em",
	height: "2em",
	flexShrink: 0,
	borderRadius: "50%",
	border: 1,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	lineHeight: 1,
	color: "text.primary",
} as const;

type ItemNavigatorRowProps = {
	section: ItemNavSection;
	onSelect: (id: string) => void;
};

export function ItemNavigatorRow({ section, onSelect }: ItemNavigatorRowProps) {
	const tint = section.status && phaseStatusStyles[section.status];
	return (
		<ButtonBase
			sx={{ ...baseRowSx, pl: section.nested ? 2 : 1 }}
			onClick={() => onSelect(section.id)}
			title={section.title ?? section.label}
		>
			{tint ? (
				<Box
					sx={{
						...circleSx,
						bgcolor: tint.bgcolor,
						borderColor: tint.borderColor,
						...(tint.ring ? { boxShadow: "0 0 0 2px" } : {}),
					}}
				>
					{section.label}
				</Box>
			) : (
				<Typography sx={labelSx}>{section.label}</Typography>
			)}
		</ButtonBase>
	);
}
