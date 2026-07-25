import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import { Fragment, useMemo } from "react";
import { highlightFileLines } from "./highlightFileLines";
import { syntaxTokenSx } from "./syntaxTokenSx";

const fileLinesSx = (theme: Theme) => ({
	display: "grid",
	gridTemplateColumns: "auto minmax(0, 1fr)",
	columnGap: 2,
	fontFamily: "monospace",
	fontSize: 13,
	lineHeight: 1.5,
	border: `1px solid ${theme.palette.divider}`,
	borderRadius: 1,
	overflowX: "auto",
	py: 1,
	"& .file-line-number": {
		color: theme.palette.text.disabled,
		textAlign: "right",
		userSelect: "none",
		pl: 1.5,
	},
	"& .file-line-text": {
		whiteSpace: "pre",
		pr: 1.5,
	},
	...syntaxTokenSx(theme),
});

export function FileLines({
	content,
	path,
}: {
	content: string;
	path: string;
}) {
	const lines = useMemo(
		() => highlightFileLines(content, path),
		[content, path],
	);

	return (
		<Box sx={fileLinesSx}>
			{lines.map((tokens, index) => (
				<Fragment key={index}>
					<span className="file-line-number">{index + 1}</span>
					<span className="file-line-text">
						{tokens.map((token, tokenIndex) => (
							<span key={tokenIndex} className={token.className}>
								{token.text}
							</span>
						))}
					</span>
				</Fragment>
			))}
		</Box>
	);
}
