import chalk from "chalk";
import { applyConfigUnset } from "./applyConfigUnset";
import { exitWithConfigErrors } from "./exitWithConfigErrors";

type ConfigUnsetOptions = {
	global?: boolean;
};

export function configUnset(
	key: string,
	options: ConfigUnsetOptions = {},
): void {
	const result = applyConfigUnset(key, options.global ?? false);
	if (!result.ok) exitWithConfigErrors(result.errors);
	if (!result.removed) {
		console.log(
			chalk.yellow(`${key} is not set in the ${result.target} config`),
		);
		return;
	}
	console.log(chalk.green(`Unset ${key} (${result.target})`));
}
