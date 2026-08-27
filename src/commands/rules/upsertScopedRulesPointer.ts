import {
	appendRulesSection,
	contentLines,
	rulesSectionRange,
} from "./rulesSectionRange";

const POINTER_PREFIX = "Directories with their own `## Rules`:";

function pointerLine(directories: string[]): string {
	return `${POINTER_PREFIX} ${directories.map((dir) => `\`${dir}\``).join(", ")}`;
}

export function upsertScopedRulesPointer(
	content: string,
	directories: string[],
): string {
	const lines = contentLines(content);
	const range = rulesSectionRange(lines);
	const existing = lines.findIndex(
		(line, index) =>
			range !== undefined &&
			index > range.start &&
			index < range.end &&
			line.startsWith(POINTER_PREFIX),
	);

	if (directories.length === 0) {
		if (existing === -1) return content;
		const without = [...lines.slice(0, existing), ...lines.slice(existing + 1)];
		return `${without
			.join("\n")
			.replace(/\n{3,}/g, "\n\n")
			.trimEnd()}\n`;
	}

	const pointer = pointerLine(directories);
	if (existing !== -1) {
		if (lines[existing] === pointer) return content;
		const replaced = [...lines];
		replaced[existing] = pointer;
		return `${replaced.join("\n")}\n`;
	}

	if (!range) return appendRulesSection(lines, pointer);

	let at = range.end;
	while (at > range.start + 1 && (lines[at - 1] ?? "").trim() === "") at--;
	return `${[...lines.slice(0, at), "", pointer, ...lines.slice(at)].join("\n")}\n`;
}
