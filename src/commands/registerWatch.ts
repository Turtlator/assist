import type { Command } from "commander";
import { watchReport } from "./watch/watchReport";
import { watchWait } from "./watch/watchWait";

export function registerWatch(program: Command): void {
	const watchCommand = program
		.command("watch")
		.description("Wait on upstream movement for the current branch");

	watchCommand
		.command("wait")
		.description(
			"Block until the current branch's upstream gains commits, then exit 0 (2 on timeout, 3 when --pull hits genuine divergence, 4 when --build fails, 1 when waiting is impossible, 130 on interrupt)",
		)
		.option(
			"--interval <duration>",
			"How often to fetch after the fetch at startup (e.g. 30s, 2m)",
			"30s",
		)
		.option(
			"--timeout <duration>",
			"Give up and exit 2 after this long (e.g. 60m, 2h), or none to wait indefinitely",
			"none",
		)
		.option(
			"--pull",
			"On movement, fast-forward with git pull --ff-only, recovering a dirty tree or a merely-behind branch; exit 3 with git's reason on genuine divergence",
		)
		.option(
			"--build [entry]",
			"After a successful pull, run this run entry (default auto-build); exit 4 with its output when it fails",
		)
		.action(
			(options: {
				interval: string;
				timeout: string;
				pull?: boolean;
				build?: boolean | string;
			}) => watchWait(options),
		);

	watchCommand
		.command("report")
		.description(
			"Print the built version, the last 10 commits as a markdown table, the restarts the new commits make necessary, and whether ~/.claude needs a sync",
		)
		.option(
			"--from <sha>",
			"Mark commits reachable from HEAD but not <sha> as new, and derive the restart and sync advice from the files they changed",
		)
		.action((options: { from?: string }) => watchReport(options));
}
