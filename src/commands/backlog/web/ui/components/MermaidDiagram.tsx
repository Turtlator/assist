import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { renderMermaidDiagram } from "./renderMermaidDiagram";
import { unclampSvgWidth } from "./unclampSvgWidth";

export function MermaidDiagram({
	source,
	mode,
	naturalWidth = false,
}: {
	source: string;
	mode: "light" | "dark";
	naturalWidth?: boolean;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const target = ref.current;
		if (!target) return;
		let cancelled = false;
		void renderMermaidDiagram(target, source, mode, () => cancelled).then(
			() => {
				if (!cancelled && naturalWidth) unclampSvgWidth(target);
			},
		);
		return () => {
			cancelled = true;
		};
	}, [source, mode, naturalWidth]);

	return (
		<Box
			ref={ref}
			className="mermaid-diagram"
			sx={naturalWidth ? { overflowX: "auto", maxWidth: "100%" } : undefined}
		/>
	);
}
