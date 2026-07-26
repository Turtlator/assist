import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecFileSync = vi.fn();

vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => mockExecFileSync(...args),
}));

import { describePull } from "./describePull";
import { pullFastForward } from "./pullFastForward";

describe("pullFastForward", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("pulls --ff-only and reports the resulting sha", () => {
		mockExecFileSync.mockImplementation((_cmd: string, args: string[]) => {
			if (args.join(" ") === "pull --ff-only")
				return "Updating aaa1111..def5678\n";
			if (args.join(" ") === "rev-parse @") return "def5678222222\n";
			throw new Error(`unexpected git ${args.join(" ")}`);
		});

		expect(pullFastForward()).toEqual({
			kind: "fast-forwarded",
			sha: "def5678222222",
		});
		expect(mockExecFileSync).toHaveBeenCalledWith(
			"git",
			["pull", "--ff-only"],
			expect.anything(),
		);
	});

	it("reports git's reason and exit 3 when the pull is not a fast-forward", () => {
		mockExecFileSync.mockImplementation((_cmd: string, args: string[]) => {
			if (args.join(" ") === "pull --ff-only") {
				throw Object.assign(new Error("Command failed"), {
					stderr: "fatal: Not possible to fast-forward, aborting.\n",
				});
			}
			throw new Error(`unexpected git ${args.join(" ")}`);
		});

		const result = pullFastForward();

		expect(result).toEqual({
			kind: "blocked",
			reason: "fatal: Not possible to fast-forward, aborting.",
		});
		expect(describePull(result).exitCode).toBe(3);
	});

	it("never forces, rebases, or resets", () => {
		mockExecFileSync.mockImplementation((_cmd: string, args: string[]) => {
			if (args.join(" ") === "pull --ff-only") {
				throw Object.assign(new Error("Command failed"), {
					stderr: "fatal: Not possible to fast-forward, aborting.\n",
				});
			}
			throw new Error(`unexpected git ${args.join(" ")}`);
		});

		pullFastForward();

		const invoked = mockExecFileSync.mock.calls.map((call) =>
			(call[1] as string[]).join(" "),
		);
		expect(invoked).toEqual(["pull --ff-only"]);
	});
});
