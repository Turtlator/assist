const RULES_HEADING = /^##\s+rules\s*$/i;
const SECTION_END = /^#{1,2}\s/;
const RULE_BULLET = /^\s*[-*]\s+\*\*\s*([^*]+?)\s*\*\*\s*(?:[—–:-]\s*)?(.*)$/;

type ParsedRule = {
	code: string;
	text: string;
};

export function parseRulesSection(content: string): ParsedRule[] {
	const lines = content.split(/\r?\n/);
	const start = lines.findIndex((line) => RULES_HEADING.test(line));
	if (start === -1) return [];

	const rules: ParsedRule[] = [];
	for (const line of lines.slice(start + 1)) {
		if (SECTION_END.test(line)) break;
		const match = RULE_BULLET.exec(line);
		if (!match) continue;
		const code = match[1].trim();
		const text = match[2].trim();
		if (code === "" || text === "") continue;
		rules.push({ code, text });
	}
	return rules;
}
