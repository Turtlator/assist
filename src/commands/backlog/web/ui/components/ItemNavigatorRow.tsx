import { ButtonBase } from "@mui/material";
import type { ItemNavSection } from "./itemNavSections";
import { phaseStatusStyles } from "./phaseStatusStyles";

const FONT_SIZE = "1.75rem";

const translucentHoverOverlaySx = {
	position: "relative",
	borderRadius: 1,
	"&::after": {
		content: '""',
		position: "absolute",
		inset: 0,
		borderRadius: "inherit",
		pointerEvents: "none",
	},
	"&:hover::after": { bgcolor: "action.hover" },
	"&:active::after": { bgcolor: "action.selected" },
} as const;

const labelButtonSx = {
	...translucentHoverOverlaySx,
	display: "block",
	maxWidth: "100%",
	px: 1,
	py: 0.5,
	border: 0,
	bgcolor: "transparent",
	fontSize: FONT_SIZE,
	lineHeight: 1.2,
	letterSpacing: "0.02em",
	textAlign: "left",
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
	color: "text.secondary",
} as const;

const circleButtonSx = {
	...translucentHoverOverlaySx,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	fontSize: FONT_SIZE,
	width: "2em",
	height: "2em",
	flexShrink: 0,
	lineHeight: 1,
	borderRadius: "50%",
	border: 1,
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
			sx={
				tint
					? {
							...circleButtonSx,
							ml: 1.5,
							bgcolor: tint.bgcolor,
							borderColor: tint.borderColor,
							...(tint.ring ? { boxShadow: "0 0 0 2px" } : {}),
						}
					: labelButtonSx
			}
			onClick={() => onSelect(section.id)}
			title={section.title ?? section.label}
		>
			{section.label}
		</ButtonBase>
	);
}
