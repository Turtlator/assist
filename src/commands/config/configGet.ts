import chalk from "chalk";
import { describeConfigNode } from "../../shared/describeConfigNode";
import { loadConfig } from "../../shared/loadConfig";
import { maskConfigSecrets } from "../../shared/maskConfigSecrets";
import { assistConfigSchema } from "../../shared/types";
import { configEntryNode } from "./configEntryNode";
import { getNestedValue } from "./getNestedValue";

type ConfigGetOptions = { reveal?: boolean };

export function configGet(key: string, options: ConfigGetOptions = {}): void {
	const value = requireNestedValue(
		loadConfig() as Record<string, unknown>,
		key,
	);
	console.log(formatOutput(options.reveal ? value : maskSecretsAt(value, key)));
}

function maskSecretsAt(value: unknown, key: string): unknown {
	const node = configEntryNode(describeConfigNode(assistConfigSchema), key);
	return maskConfigSecrets(value, node);
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
	console.error(chalk.red(`Key "${key}" is not set`));
	process.exit(1);
}
