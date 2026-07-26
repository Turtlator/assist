import type { Command } from "commander";
import { watchWait } from "./watch/watchWait";

export function registerWatch(program: Command): void {
	const watchCommand = program
		.command("watch")
		.description("Wait on upstream movement for the current branch");

	watchCommand
		.command("wait")
		.description(
			"Block until the current branch's upstream gains commits, then exit 0 (2 on timeout, 3 when --pull is not a fast-forward, 1 when waiting is impossible, 130 on interrupt)",
		)
		.option("--interval <duration>", "How often to fetch (e.g. 30s, 2m)", "30s")
		.option(
			"--timeout <duration>",
			"Give up and exit 2 after this long (e.g. 60m, 2h)",
			"60m",
		)
		.option(
			"--pull",
			"On movement, fast-forward with git pull --ff-only; exit 3 with git's reason if it is not a clean fast-forward",
		)
		.action((options: { interval: string; timeout: string; pull?: boolean }) =>
			watchWait(options),
		);
}
