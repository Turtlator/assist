import chalk from "chalk";
import type { ConfigHelpEntry } from "../../shared/configHelp";
import {
	type ConfigLeaf,
	describeConfigLeaves,
} from "../../shared/describeConfigLeaves";
import { assistConfigSchema } from "../../shared/types";
import { configHelpForKey } from "./configHelpForKey";
import { formatConfigDefault } from "./formatConfigDefault";

export function configKeys(filter?: string): void {
	const leaves = describeConfigLeaves(assistConfigSchema);
	const matches = filter ? leaves.filter(matching(filter)) : leaves;

	if (matches.length === 0) {
		console.error(chalk.red(`No config key matches "${filter}"`));
		process.exit(1);
	}

	console.log(headline(matches.length, leaves.length, filter));
	console.log(
		chalk.dim(
			"Defaults come from the schema; assist config list shows what is set.",
		),
	);

	for (const leaf of matches) {
		console.log("");
		for (const line of formatLeaf(leaf, configHelpForKey(leaf.key))) {
			console.log(line);
		}
	}
}

function matching(filter: string): (leaf: ConfigLeaf) => boolean {
	const needle = filter.toLowerCase();
	return (leaf) => leaf.key.toLowerCase().includes(needle);
}

function headline(
	shown: number,
	total: number,
	filter: string | undefined,
): string {
	return filter
		? chalk.bold(`${shown} of ${total} config keys matching "${filter}"`)
		: chalk.bold(`${total} config keys`);
}

function formatLeaf(
	leaf: ConfigLeaf,
	help: ConfigHelpEntry | undefined,
): string[] {
	const meta = [typeText(leaf), `default: ${formatConfigDefault(leaf)}`];
	if (leaf.secret) meta.push("secret");
	const lines = [`${chalk.cyan(leaf.key)}  ${chalk.dim(meta.join("  "))}`];
	if (help) lines.push(`  ${help.note}`, `  ${chalk.green(help.setter)}`);
	return lines;
}

function typeText(leaf: ConfigLeaf): string {
	if (leaf.enumValues) return leaf.enumValues.join(" | ");
	if (leaf.unionTypes) return leaf.unionTypes.join(" | ");
	if (leaf.itemType) return `${leaf.itemType}[]`;
	return leaf.type;
}
