import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { useMemo } from "react";

export function MarkdownHtml({
	html,
	component = "div",
	className,
	sx,
}: {
	html: string;
	component?: "div" | "span";
	className?: string;
	sx?: SxProps<Theme>;
}) {
	const dangerous = useMemo(() => ({ __html: html }), [html]);
	return (
		<Box
			component={component}
			className={className}
			sx={sx}
			dangerouslySetInnerHTML={dangerous}
		/>
	);
}
