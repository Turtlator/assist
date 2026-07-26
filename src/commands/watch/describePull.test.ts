import { describe, expect, it } from "vitest";
import { describePull } from "./describePull";

describe("describePull", () => {
	it("exits 0 with the shortened resulting sha after a fast-forward", () => {
		expect(
			describePull({
				kind: "fast-forwarded",
				sha: "def5678222222222222222222222222222222222",
			}),
		).toEqual({ exitCode: 0, message: "pulled --ff-only → def5678" });
	});

	it("exits 3 carrying git's own reason when the pull is not a fast-forward", () => {
		expect(
			describePull({
				kind: "blocked",
				reason: "fatal: Not possible to fast-forward, aborting.",
			}),
		).toEqual({
			exitCode: 3,
			message:
				"pull was not a fast-forward:\nfatal: Not possible to fast-forward, aborting.",
		});
	});

	it("keeps a multi-line git reason intact", () => {
		const reason =
			"error: Your local changes to the following files would be overwritten by merge:\n\tsrc/index.ts\nPlease commit your changes or stash them before you merge.";

		expect(describePull({ kind: "blocked", reason })).toEqual({
			exitCode: 3,
			message: `pull was not a fast-forward:\n${reason}`,
		});
	});
});
