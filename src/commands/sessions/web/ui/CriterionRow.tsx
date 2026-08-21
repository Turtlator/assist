import { Box, InputBase } from "@mui/material";

const INDENT_PX = 22;

const rowSx = {
	display: "flex",
	alignItems: "flex-start",
	gap: 1,
} as const;

const numberSx = {
	fontFamily: "monospace",
	fontSize: "0.8rem",
	color: "text.secondary",
	minWidth: 32,
	pt: "5px",
	textAlign: "right",
	userSelect: "none",
	whiteSpace: "nowrap",
} as const;

const textSx = {
	flex: 1,
	fontSize: "inherit",
	lineHeight: 1.5,
	px: 0.75,
	py: 0,
	borderRadius: 1,
	"&:hover": { bgcolor: "action.hover" },
	"&.Mui-focused": { bgcolor: "action.selected" },
} as const;

export function CriterionRow({
	number,
	depth,
	text,
	onText,
}: {
	number: string;
	depth: number;
	text: string;
	onText: (text: string) => void;
}) {
	return (
		<Box sx={rowSx} style={{ marginLeft: depth * INDENT_PX }}>
			<Box component="span" sx={numberSx} aria-hidden="true">
				{`${number}.`}
			</Box>
			<InputBase
				multiline
				value={text}
				sx={textSx}
				inputProps={{ "aria-label": `Criterion ${number}` }}
				onChange={(e) => onText(e.target.value.replace(/[\r\n]+/g, " "))}
				onKeyDown={(e) => {
					if (e.key === "Enter") e.preventDefault();
				}}
			/>
		</Box>
	);
}
