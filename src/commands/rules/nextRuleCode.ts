import { readFileSync } from "node:fs";
import { findClaudeFiles } from "./findClaudeFiles";
import { parseRulesSection } from "./parseRulesSection";

const CODE_PREFIX = "R";

export function nextRuleCode(root: string): string {
	const numbers = findClaudeFiles(root).flatMap((file) =>
		parseRulesSection(readFileSync(file, "utf8")).map((rule) =>
			Number(/(\d+)\s*$/.exec(rule.code)?.[1] ?? 0),
		),
	);

	return `${CODE_PREFIX}${Math.max(0, ...numbers) + 1}`;
}
