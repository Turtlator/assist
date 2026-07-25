import type { ItemNavSection } from "./itemNavSections";
import { phaseStatusStyles } from "./phaseStatusStyles";

const FONT_SIZE = "1.3125rem";

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
	flexShrink: 0,
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

const activeCircleSx = {
	borderColor: "text.primary",
	borderWidth: 3,
} as const;

const activeLabelSx = {
	color: "text.primary",
	fontWeight: 700,
	"&::after": { bgcolor: "action.selected" },
} as const;

export function itemNavigatorRowSx(section: ItemNavSection, active: boolean) {
	const tint = section.status && phaseStatusStyles[section.status];
	if (!tint) return { ...labelButtonSx, ...(active && activeLabelSx) };
	return {
		...circleButtonSx,
		ml: 1.5,
		bgcolor: tint.bgcolor,
		borderColor: tint.borderColor,
		borderWidth: tint.ring ? 3 : 1,
		...(active && activeCircleSx),
	};
}
