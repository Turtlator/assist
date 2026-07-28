import { formatElapsed } from "../../shared/formatElapsed";
import { runCommandToCompletion } from "./runCommandToCompletion";

export function spawnRunCommand(
	command: string,
	args: string[],
	env?: Record<string, string>,
	cwd?: string,
	quiet?: boolean,
): void {
	const start = Date.now();
	void runCommandToCompletion(command, args, env, cwd, quiet).then((result) => {
		if (result.kind === "failed") {
			console.error(result.message);
			process.exit(1);
		}
		const { exitCode, output } = result;
		if (quiet && exitCode !== 0 && output.length > 0) {
			process.stdout.write(output);
		}
		const elapsed = formatElapsed(Date.now() - start);
		if (!quiet || exitCode !== 0) console.log(`\nDone in ${elapsed}`);
		process.exit(exitCode);
	});
}
