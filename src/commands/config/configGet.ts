import chalk from "chalk";
import { describeConfigLeaves } from "../../shared/describeConfigLeaves";
import { loadConfig } from "../../shared/loadConfig";
import { assistConfigSchema } from "../../shared/types";
import { configHelpForKey } from "./configHelpForKey";
import { formatConfigDefault } from "./formatConfigDefault";
import { getNestedValue } from "./getNestedValue";
import { maskConfigKeySecrets } from "./maskConfigKeySecrets";

type ConfigGetOptions = { reveal?: boolean };

export function configGet(key: string, options: ConfigGetOptions = {}): void {
	const value = requireNestedValue(
		loadConfig() as Record<string, unknown>,
		key,
	);
	console.log(
		formatOutput(options.reveal ? value : maskConfigKeySecrets(key, value)),
	);
}

function formatOutput(value: unknown): string {
	return typeof value === "object" && value !== null
		? JSON.stringify(value, null, 2)
		: String(value);
}

function requireNestedValue(
	config: Record<string, unknown>,
	key: string,
): unknown {
	const value = getNestedValue(config, key);
	if (value === undefined) return exitKeyNotSet(key);
	return value;
}

function exitKeyNotSet(key: string): never {
	for (const line of unsetLines(key)) console.error(line);
	process.exit(1);
}

function unsetLines(key: string): string[] {
	const leaf = describeConfigLeaves(assistConfigSchema).find(
		(candidate) => candidate.key === key,
	);
	if (!leaf) return [chalk.red(`Key "${key}" is not set`)];

	const lines = [
		chalk.red(
			leaf.defaultValue === undefined
				? `Key "${key}" is not set and has no schema default`
				: `Key "${key}" is not set; the schema default is ${formatConfigDefault(leaf)}`,
		),
	];
	const help = configHelpForKey(key);
	if (help) lines.push(help.note, chalk.green(help.setter));
	return lines;
}
