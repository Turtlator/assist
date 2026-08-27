import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { findRepoRoot } from "../../shared/findRepoRoot";
import { insertRuleBullet } from "./insertRuleBullet";
import { nextRuleCode } from "./nextRuleCode";
import { resolveRuleScope } from "./resolveRuleScope";
import { scopedRuleDirectories } from "./scopedRuleDirectories";
import { upsertScopedRulesPointer } from "./upsertScopedRulesPointer";

function read(file: string): string {
	return existsSync(file) ? readFileSync(file, "utf8") : "";
}

export function addRule(text: string, options: { scope?: string }): void {
	const rule = text.trim();
	if (rule === "") {
		console.error(chalk.red("Rule text is required"));
		process.exitCode = 1;
		return;
	}

	const target = resolveRuleScope(options.scope ?? process.cwd());
	const targetDir = path.dirname(target);
	const root = findRepoRoot(targetDir) ?? targetDir;
	const code = nextRuleCode(root);

	writeFileSync(target, insertRuleBullet(read(target), code, rule));

	const rootFile = path.join(root, "CLAUDE.md");
	const before = read(rootFile);
	const after = upsertScopedRulesPointer(before, scopedRuleDirectories(root));
	if (after !== before) writeFileSync(rootFile, after);

	console.log(
		`Added ${chalk.cyan(code)} to ${path.relative(process.cwd(), target) || target}`,
	);
}
