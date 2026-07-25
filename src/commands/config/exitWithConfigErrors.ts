import chalk from "chalk";

export function exitWithConfigErrors(errors: string[]): never {
	for (const error of errors) console.error(chalk.red(error));
	process.exit(1);
}
