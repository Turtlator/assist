import { Box, useTheme } from "@mui/material";
import { marked } from "marked";
import { useMemo } from "react";
import { markdownSx, wideMarkdownSx } from "./markdownSx";
import { MermaidDiagram } from "./MermaidDiagram";
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
	const segments = useMemo(
		() => (renderMermaid ? splitMarkdownSegments(content) : null),
		[content, renderMermaid],
	);
	const sx = wide ? wideMarkdownSx : markdownSx;

	if (!segments) {
		return (
			<Box
				className="markdown"
				sx={sx}
				dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
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
