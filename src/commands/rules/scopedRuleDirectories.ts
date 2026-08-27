import { readFileSync } from "node:fs";
import path from "node:path";
import { findClaudeFiles } from "./findClaudeFiles";
import { parseRulesSection } from "./parseRulesSection";

export function scopedRuleDirectories(root: string): string[] {
	return findClaudeFiles(root)
		.filter(
			(file) =>
				path.dirname(file) !== root &&
				parseRulesSection(readFileSync(file, "utf8")).length > 0,
		)
		.map(
			(file) =>
				`${path.relative(root, path.dirname(file)).split(path.sep).join("/")}/`,
		)
		.sort();
}
