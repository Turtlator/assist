import chalk from "chalk";
import { applyConfigSet, type ConfigWritableValue } from "./applyConfigSet";
import { applyRepoConfigSet } from "./applyRepoConfigSet";
import { coerceCliConfigValue } from "./coerceCliConfigValue";
import { exitWithConfigErrors } from "./exitWithConfigErrors";
import { resolveRepoTarget } from "./resolveRepoTarget";

type ConfigSetOptions = {
	global?: boolean;
	repo?: boolean | string;
};

export function configSet(
	key: string,
	value: string | undefined,
	options: ConfigSetOptions = {},
): void {
	if (options.repo !== undefined && !options.global) {
		console.error(
			chalk.red("--repo writes to the global config; add -g (e.g. -g --repo)"),
		);
		process.exit(1);
	}

	const resolved = resolveRepoTarget(key, value, options.repo);
	if (resolved.value === undefined) {
		console.error(chalk.red(`Missing required argument for '${resolved.key}'`));
		process.exit(1);
	}

	const coercion = coerceCliConfigValue(resolved.key, resolved.value);
	if (!coercion.ok) exitWithConfigErrors([coercion.error]);
	const coerced = coercion.value;
	const target = resolved.useRepo
		? `repo: ${applyRepoOrExit(resolved.key, coerced, resolved.repoName)}`
		: applyOrExit(resolved.key, coerced, options.global ?? false);
	console.log(
		chalk.green(`Set ${resolved.key} = ${JSON.stringify(coerced)} (${target})`),
	);
}

function applyOrExit(
	key: string,
	coerced: ConfigWritableValue,
	global: boolean,
): string {
	const result = applyConfigSet(key, coerced, global);
	if (!result.ok) exitWithConfigErrors(result.errors);
	return result.target;
}

function applyRepoOrExit(
	key: string,
	coerced: ConfigWritableValue,
	repoName: string | undefined,
): string {
	const result = applyRepoConfigSet(key, coerced, repoName);
	if (!result.ok) exitWithConfigErrors(result.errors);
	return result.label;
}
