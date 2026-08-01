export const DIFF_TREE_INDENT = 10;
export const DIFF_TREE_CHEVRON_WIDTH = 20;

export const diffFileTreeRowSx = {
	display: "flex",
	justifyContent: "flex-start",
	alignItems: "center",
	gap: 0.5,
	width: "100%",
	minWidth: 0,
	py: 0.25,
	borderRadius: 1,
	"&:hover": { bgcolor: "action.hover" },
} as const;

export const diffFileTreeActiveRowSx = {
	bgcolor: "action.selected",
	fontWeight: 600,
} as const;

export const diffFileTreeNameSx = {
	fontFamily: "monospace",
	fontSize: 12,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;
