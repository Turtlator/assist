const MAX_LENGTH = 2048;
const INTERRUPT_PREFIX = "[Request interrupted";

type RawEntry = Record<string, unknown>;

export function extractLastUserMessage(
	entries: RawEntry[],
	maxLength = MAX_LENGTH,
): string | undefined {
	for (let i = entries.length - 1; i >= 0; i--) {
		const entry = entries[i];
		if (entry.isSidechain || entry.isMeta) continue;
		if (entry.type !== "user") continue;
		const raw = promptTextOrNull(entry);
		if (raw === null) continue;
		const message = renderPrompt(raw);
		if (message) return cap(message, maxLength);
	}
	return undefined;
}

function promptTextOrNull(entry: RawEntry): string | null {
	const content = asRecord(entry.message)?.content;
	if (typeof content === "string") return isInterrupt(content) ? null : content;
	if (!Array.isArray(content)) return null;

	const parts: string[] = [];
	for (const block of content) {
		const b = asRecord(block);
		if (b?.type !== "text") continue;
		const text = typeof b.text === "string" ? b.text : "";
		if (isInterrupt(text)) return null;
		parts.push(text);
	}
	return parts.length === 0 ? null : parts.join("\n");
}

function renderPrompt(raw: string): string {
	const command = marker(raw, "command-name");
	if (command) {
		const args = marker(raw, "command-args");
		const name = `/${command.replace(/^\/+/, "")}`;
		return args ? `${name} ${args}` : name;
	}
	return stripBlocks(raw);
}

function stripBlocks(raw: string): string {
	return raw
		.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
		.replace(/<command-[^>]*>[\s\S]*?<\/command-[^>]*>/g, "")
		.replace(/<local-command-[^>]*>[\s\S]*?<\/local-command-[^>]*>/g, "")
		.trim();
}

function marker(raw: string, tag: string): string {
	const match = raw.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
	return match ? match[1].trim() : "";
}

function cap(message: string, maxLength: number): string {
	return message.length <= maxLength
		? message
		: `${message.slice(0, maxLength).trimEnd()}…`;
}

function isInterrupt(value: string): boolean {
	return value.trimStart().startsWith(INTERRUPT_PREFIX);
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: null;
}
