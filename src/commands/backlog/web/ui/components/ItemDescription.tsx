import { Box, Typography } from "@mui/material";
import { itemSectionAnchor } from "./itemSectionAnchor";
import { MarkdownBlock } from "./MarkdownBlock";

const sectionHeadingSx = {
	color: "text.secondary",
	mb: 1,
	display: "block",
	letterSpacing: "0.08em",
} as const;

export function ItemDescription({ description }: { description?: string }) {
	if (!description) return null;
	return (
		<Box {...itemSectionAnchor("description")}>
			<Typography variant="overline" sx={sectionHeadingSx}>
				Description
			</Typography>
			<MarkdownBlock content={description} renderMermaid />
		</Box>
	);
}
