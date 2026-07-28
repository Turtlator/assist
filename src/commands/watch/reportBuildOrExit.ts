import { runWatchBuild } from "./runWatchBuild";

export async function reportBuildOrExit(entry: string): Promise<void> {
	const outcome = await runWatchBuild(entry);
	if (outcome.kind === "built") {
		console.log(`built with "${entry}"`);
		return;
	}

	if (outcome.output.length > 0) process.stdout.write(outcome.output);
	console.error(`build "${entry}" failed with exit code ${outcome.exitCode}`);
	process.exit(4);
}
