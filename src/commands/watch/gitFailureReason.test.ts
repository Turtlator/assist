import { describe, expect, it } from "vitest";
import { gitFailureReason } from "./gitFailureReason";

describe("gitFailureReason", () => {
	it("prefers stderr, trimmed", () => {
		const error = Object.assign(new Error("Command failed"), {
			stderr: "fatal: Not possible to fast-forward, aborting.\n",
			stdout: "",
		});

		expect(gitFailureReason(error)).toBe(
			"fatal: Not possible to fast-forward, aborting.",
		);
	});

	it("falls back to stdout when stderr is empty", () => {
		const error = Object.assign(new Error("Command failed"), {
			stderr: "\n",
			stdout: "Aborting\n",
		});

		expect(gitFailureReason(error)).toBe("Aborting");
	});

	it("falls back to the error message when git said nothing", () => {
		expect(gitFailureReason(new Error("spawn git ENOENT"))).toBe(
			"spawn git ENOENT",
		);
	});

	it("reads Buffer streams", () => {
		const error = Object.assign(new Error("Command failed"), {
			stderr: Buffer.from("fatal: refusing to merge unrelated histories\n"),
		});

		expect(gitFailureReason(error)).toBe(
			"fatal: refusing to merge unrelated histories",
		);
	});

	it("never returns an empty reason", () => {
		expect(gitFailureReason("")).toBe("git failed without reporting a reason");
	});
});
