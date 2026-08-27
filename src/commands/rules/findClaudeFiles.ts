import { readdirSync } from "node:fs";
import path from "node:path";

const SKIP_DIRECTORIES = new Set(["node_modules", "dist", "build", "coverage"]);

export function findClaudeFiles(dir: string): string[] {
	const results: string[] = [];

	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			if (entry.name.startsWith(".") || SKIP_DIRECTORIES.has(entry.name))
				continue;
			results.push(...findClaudeFiles(path.join(dir, entry.name)));
		} else if (entry.name === "CLAUDE.md") {
			results.push(path.join(dir, entry.name));
		}
	}

	return results;
}
