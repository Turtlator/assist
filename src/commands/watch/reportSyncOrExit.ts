import { runPostBuildSync } from "./runPostBuildSync";

export async function reportSyncOrExit(): Promise<void> {
	const outcome = await runPostBuildSync();
	if (outcome.kind === "built") {
		console.log("synced ~/.claude");
		return;
	}

	if (outcome.output.length > 0) process.stdout.write(outcome.output);
	console.error(`sync failed with exit code ${outcome.exitCode}`);
	process.exit(4);
}
