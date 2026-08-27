const RULES_HEADING = /^##\s+rules\s*$/i;
const SECTION_END = /^#{1,2}\s/;

export const RULE_BULLET =
	/^\s*[-*]\s+\*\*\s*([^*]+?)\s*\*\*\s*(?:[—–:-]\s*)?(.*)$/;

export function rulesSectionRange(
	lines: string[],
): { start: number; end: number } | undefined {
	const start = lines.findIndex((line) => RULES_HEADING.test(line));
	if (start === -1) return undefined;

	const offset = lines
		.slice(start + 1)
		.findIndex((line) => SECTION_END.test(line));
	return { start, end: offset === -1 ? lines.length : start + 1 + offset };
}

export function contentLines(content: string): string[] {
	const trimmed = content.replace(/\s+$/, "");
	return trimmed === "" ? [] : trimmed.split(/\r?\n/);
}

export function appendRulesSection(lines: string[], entry: string): string {
	const preamble = lines.length === 0 ? [] : [...lines, ""];
	return `${[...preamble, "## Rules", "", entry].join("\n")}\n`;
}
