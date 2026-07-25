import type { RefractorNode } from "refractor/core";
import { languageForPath, refractorHighlighter } from "./refractorHighlighter";

type FileToken = { text: string; className?: string };

const MAX_HIGHLIGHT_BYTES = 400_000;

function classNamesOf(node: RefractorNode): string[] {
	const value = node.properties?.className;
	return Array.isArray(value) ? value.map(String) : [];
}

function collectTokens(
	nodes: RefractorNode[],
	inherited: string[],
	out: FileToken[],
): void {
	for (const node of nodes) {
		if (node.type === "text") {
			if (node.value)
				out.push({
					text: node.value,
					className: inherited.join(" ") || undefined,
				});
			continue;
		}
		collectTokens(
			node.children ?? [],
			[...inherited, ...classNamesOf(node)],
			out,
		);
	}
}

function toLines(tokens: FileToken[]): FileToken[][] {
	let current: FileToken[] = [];
	const lines: FileToken[][] = [current];
	for (const token of tokens) {
		const parts = token.text.split("\n");
		for (const [index, part] of parts.entries()) {
			if (index > 0) {
				current = [];
				lines.push(current);
			}
			if (part) current.push({ text: part, className: token.className });
		}
	}
	if (lines.length > 1 && current.length === 0) lines.pop();
	return lines;
}

export function highlightFileLines(
	content: string,
	path: string,
): FileToken[][] {
	const language = languageForPath(path);
	if (!language || content.length > MAX_HIGHLIGHT_BYTES)
		return toLines([{ text: content }]);
	try {
		const tokens: FileToken[] = [];
		collectTokens(
			refractorHighlighter.highlight(content, language),
			[],
			tokens,
		);
		return toLines(tokens);
	} catch {
		return toLines([{ text: content }]);
	}
}
