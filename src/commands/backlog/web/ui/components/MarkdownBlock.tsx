import { Box, useTheme } from "@mui/material";
import { useMemo } from "react";
import { markdownSx, wideMarkdownSx } from "./markdownSx";
import { MermaidDiagram } from "./MermaidDiagram";
import { renderMarkdown } from "./renderMarkdown";
import { splitMarkdownSegments } from "./splitMarkdownSegments";
import { useMarkdownBlockDebug } from "./useMarkdownBlockDebug";

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
	const segments = useMemo(
		() => (renderMermaid ? splitMarkdownSegments(content) : null),
		[content, renderMermaid],
	);
	const sx = wide ? wideMarkdownSx : markdownSx;
	useMarkdownBlockDebug(content, segments);

	if (!segments) {
		return (
			<Box
				className="markdown"
				sx={sx}
				dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
			/>
		);
	}

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
					<Box
						key={segment.key}
						dangerouslySetInnerHTML={{ __html: segment.html }}
					/>
				),
			)}
		</Box>
	);
}
