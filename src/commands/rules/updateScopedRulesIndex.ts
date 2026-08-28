import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { scopedRuleDirectories } from "./scopedRuleDirectories";
import { upsertScopedRulesPointer } from "./upsertScopedRulesPointer";

export function updateScopedRulesIndex(root: string): string[] {
	const directories = scopedRuleDirectories(root);
	const rootFile = path.join(root, "CLAUDE.md");
	const before = existsSync(rootFile) ? readFileSync(rootFile, "utf8") : "";
	const after = upsertScopedRulesPointer(before, directories);

	if (after !== before) writeFileSync(rootFile, after);
	return directories;
}
