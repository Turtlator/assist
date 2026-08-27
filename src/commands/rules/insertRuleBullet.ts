import {
	appendRulesSection,
	contentLines,
	RULE_BULLET,
	rulesSectionRange,
} from "./rulesSectionRange";

export function insertRuleBullet(
	content: string,
	code: string,
	text: string,
): string {
	const bullet = `- **${code}** — ${text}`;
	const lines = contentLines(content);
	const range = rulesSectionRange(lines);
	if (!range) return appendRulesSection(lines, bullet);

	const body = lines.slice(range.start + 1, range.end);
	const lastBullet = body.reduce(
		(last, line, index) => (RULE_BULLET.test(line) ? index : last),
		-1,
	);
	const at = lastBullet === -1 ? range.start + 1 : range.start + lastBullet + 2;
	const inserted = lastBullet === -1 ? ["", bullet] : [bullet];

	return `${[...lines.slice(0, at), ...inserted, ...lines.slice(at)].join("\n")}\n`;
}
