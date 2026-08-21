export const criterionRowSx = {
	display: "flex",
	alignItems: "flex-start",
	gap: 0.25,
	"& .criterion-action": { opacity: 0, transition: "opacity 120ms" },
	"&:hover .criterion-action": { opacity: 1 },
	"&:focus-within .criterion-action": { opacity: 1 },
	"& .criterion-action:focus-visible": { opacity: 1 },
} as const;

export const criterionGripSx = {
	p: 0.25,
	mt: "2px",
	color: "text.disabled",
	cursor: "grab",
	touchAction: "none",
	"&:active": { cursor: "grabbing" },
} as const;

export const criterionNumberSx = {
	fontFamily: "monospace",
	fontSize: "0.8rem",
	color: "text.secondary",
	minWidth: 32,
	pt: "5px",
	textAlign: "right",
	userSelect: "none",
	whiteSpace: "nowrap",
} as const;

export const criterionTextSx = {
	flex: 1,
	fontSize: "inherit",
	lineHeight: 1.5,
	px: 0.75,
	py: 0,
	borderRadius: 1,
	"&:hover": { bgcolor: "action.hover" },
	"&.Mui-focused": { bgcolor: "action.selected" },
} as const;

export const criterionActionSx = { p: 0.25, mt: "2px" } as const;

export const criterionDropLineSx = {
	position: "absolute",
	right: 8,
	height: 2,
	borderRadius: 1,
	bgcolor: "primary.main",
	pointerEvents: "none",
} as const;
