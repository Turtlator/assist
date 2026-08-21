export const previewBodySx = {
	flex: 1,
	overflow: "auto",
	p: 2,
	position: "relative",
	userSelect: "none",
	cursor: "text",
	lineHeight: 1.7,
	wordBreak: "break-word",
	"& p": { mt: 0 },
	"& a": { color: "primary.main" },
	"& mark.pr-comment": {
		color: "inherit",
		borderRadius: "2px",
	},
} as const;
