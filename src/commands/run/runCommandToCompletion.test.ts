import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runCommandToCompletion } from "./runCommandToCompletion";

describe("runCommandToCompletion", () => {
	it("names the missing directory instead of spawning the command", async () => {
		const cwd = join(process.cwd(), "no-such-dir");

		await expect(
			runCommandToCompletion("npm", ["run", "start"], undefined, cwd),
		).resolves.toEqual({
			kind: "failed",
			message: `Failed to execute command: cwd ${cwd} does not exist`,
		});
	});

	it("runs the command when the cwd exists", async () => {
		await expect(
			runCommandToCompletion(
				"node",
				["-e", ""],
				undefined,
				process.cwd(),
				true,
			),
		).resolves.toMatchObject({ kind: "completed", exitCode: 0 });
	});
});
