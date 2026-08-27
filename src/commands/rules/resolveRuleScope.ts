import { existsSync } from "node:fs";
import path from "node:path";
import { findRepoRoot } from "../../shared/findRepoRoot";
import { scopeDirectory } from "./scopeDirectory";

export function resolveRuleScope(target: string): string {
	const resolved = path.resolve(target);
	if (path.basename(resolved) === "CLAUDE.md") return resolved;

	const startDir = scopeDirectory(resolved);
	const root = findRepoRoot(startDir) ?? startDir;

	let current = startDir;
	while (true) {
		const candidate = path.join(current, "CLAUDE.md");
		if (existsSync(candidate)) return candidate;
		if (current === root || current === path.dirname(current)) break;
		current = path.dirname(current);
	}

	return path.join(root, "CLAUDE.md");
}
