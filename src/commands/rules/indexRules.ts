import path from "node:path";
import chalk from "chalk";
import { findRepoRoot } from "../../shared/findRepoRoot";
import { scopeDirectory } from "./scopeDirectory";
import { updateScopedRulesIndex } from "./updateScopedRulesIndex";

export function indexRules(target?: string): void {
	const startDir = scopeDirectory(path.resolve(target ?? process.cwd()));
	const root = findRepoRoot(startDir) ?? startDir;
	const directories = updateScopedRulesIndex(root);
	const rootFile = path.relative(process.cwd(), path.join(root, "CLAUDE.md"));

	if (directories.length === 0) {
		console.log(
			chalk.gray(`No directories carry their own \`## Rules\` under ${root}`),
		);
		return;
	}

	console.log(`Recorded in ${rootFile || "CLAUDE.md"}`);
	for (const directory of directories)
		console.log(`  ${chalk.cyan(directory)}`);
}
