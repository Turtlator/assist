import { Box, useTheme } from "@mui/material";
import { useMemo } from "react";
import { countRender } from "../../../../sessions/web/ui/renderCounters";
import { MarkdownHtml } from "./MarkdownHtml";
import { markdownSx, wideMarkdownSx } from "./markdownSx";
import { MermaidDiagram } from "./MermaidDiagram";
import { renderMarkdown } from "./renderMarkdown";
import { splitMarkdownSegments } from "./splitMarkdownSegments";

export function MarkdownBlock({
	content,
	renderMermaid = false,
	wide = false,
}: {
	content: string;
	renderMermaid?: boolean;
	wide?: boolean;
}) {
	const mode = useTheme().palette.mode;
	countRender("MarkdownBlock");
	const segments = useMemo(
		() => (renderMermaid ? splitMarkdownSegments(content) : null),
		[content, renderMermaid],
	);
	const sx = wide ? wideMarkdownSx : markdownSx;

	if (!segments)
		return (
			<MarkdownHtml
				className="markdown"
				sx={sx}
				html={renderMarkdown(content)}
			/>
		);

	return (
		<Box className="markdown" sx={sx}>
			{segments.map((segment) =>
				segment.type === "mermaid" ? (
					<MermaidDiagram
						key={segment.key}
						source={segment.source}
						mode={mode}
						naturalWidth={wide}
					/>
				) : (
					<MarkdownHtml key={segment.key} html={segment.html} />
				),
			)}
		</Box>
	);
}
