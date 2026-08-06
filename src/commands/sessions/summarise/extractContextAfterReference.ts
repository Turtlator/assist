import { entryMessages } from "../shared/entryMessages";
import { isBareReferencePrompt } from "../shared/isReferenceOnlyPrompt";
import { readTranscriptHead } from "./readTranscriptHead";

const MIN_CONTEXT_CHARS = 120;
const MAX_CONTEXT_CHARS = 800;

type ContentBlock = {
	type?: string;
	text?: string;
	content?: unknown;
	is_error?: boolean;
};

export function extractContextAfterReference(
	filePath: string,
): string | undefined {
	const head = readTranscriptHead(filePath);
	if (head === undefined) return undefined;

	const parts: string[] = [];
	let length = 0;
	for (const text of conversationText(head)) {
		if (parts.length === 0 && isBareReferencePrompt(text)) continue;
		parts.push(text);
		length += text.length;
		if (length >= MAX_CONTEXT_CHARS) break;
	}
	if (length < MIN_CONTEXT_CHARS) return undefined;
	return parts.join("\n").slice(0, MAX_CONTEXT_CHARS);
}

function* conversationText(head: string): Generator<string> {
	for (const line of head.split("\n")) {
		if (!line) continue;
		const entry = parseEntry(line);
		if (!entry || entry.isSidechain || entry.isMeta) continue;
		for (const text of entryText(entry)) {
			const trimmed = text.trim();
			if (trimmed) yield trimmed;
		}
	}
}

function* entryText(entry: Record<string, unknown>): Generator<string> {
	for (const message of entryMessages(entry)) {
		if (message.role === "tool") continue;
		yield message.text;
	}
	yield* fetchedReferenceText(entry);
}

function* fetchedReferenceText(
	entry: Record<string, unknown>,
): Generator<string> {
	const content = (entry.message as { content?: unknown } | undefined)?.content;
	if (!Array.isArray(content)) return;
	for (const block of content as ContentBlock[]) {
		if (block.type !== "tool_result" || block.is_error) continue;
		yield toolResultBody(block.content);
	}
}

function toolResultBody(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	return (content as ContentBlock[])
		.filter((block) => block.type === "text")
		.map((block) => block.text ?? "")
		.join("\n");
}

function parseEntry(line: string): Record<string, unknown> | undefined {
	try {
		return JSON.parse(line);
	} catch {
		return undefined;
	}
}
