import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { findRepoRoot } from "../../shared/findRepoRoot";
import { parseRulesSection } from "./parseRulesSection";
import { scopeDirectory } from "./scopeDirectory";
import type { ScopedRule } from "./types";

function scopedClaudeFiles(target: string): string[] {
	const startDir = scopeDirectory(target);
	const root = findRepoRoot(startDir) ?? startDir;

	const files: string[] = [];
	let current = startDir;
	while (true) {
		const candidate = path.join(current, "CLAUDE.md");
		if (existsSync(candidate)) files.push(candidate);
		if (current === root || current === path.dirname(current)) break;
		current = path.dirname(current);
	}
	return files;
}

export function readScopedRules(target: string): ScopedRule[] {
	return scopedClaudeFiles(target).flatMap((source) =>
		parseRulesSection(readFileSync(source, "utf8")).map((rule) => ({
			...rule,
			source,
		})),
	);
}
