import Box from "@mui/material/Box";
import { marked } from "marked";
import {
	type ReactNode,
	type RefObject,
	useLayoutEffect,
	useMemo,
	useRef,
} from "react";
import { applyHighlights } from "./applyHighlights";

type ColoredOffsets = { start: number; end: number; color: string };

export function MarkdownSections({
	content,
	control,
	trailing,
	ranges,
	contentRef,
}: {
	content: string;
	control: ReactNode;
	trailing: string | undefined;
	ranges: ColoredOffsets[];
	contentRef: RefObject<HTMLDivElement | null>;
}) {
	const leadRef = useRef<HTMLDivElement | null>(null);
	const trailRef = useRef<HTMLDivElement | null>(null);
	const html = useMemo(() => marked.parse(content) as string, [content]);
	const trailingHtml = useMemo(
		() => (trailing ? (marked.parse(trailing) as string) : ""),
		[trailing],
	);

	useLayoutEffect(() => {
		const root = contentRef.current;
		const lead = leadRef.current;
		if (!root || !lead) return;
		lead.innerHTML = html;
		if (trailRef.current) trailRef.current.innerHTML = trailingHtml;
		applyHighlights(root, ranges);
	}, [html, trailingHtml, ranges, contentRef]);

	return (
		<Box ref={contentRef}>
			<Box ref={leadRef} className="markdown" />
			{control}
			{control ? <Box ref={trailRef} className="markdown" /> : null}
		</Box>
	);
}
