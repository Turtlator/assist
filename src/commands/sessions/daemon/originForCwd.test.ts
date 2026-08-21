import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveCurrentOrigin } from "../../backlog/getCurrentOrigin";
import { originForCwd, originResolutionForCwd } from "./originForCwd";

vi.mock("../../backlog/getCurrentOrigin", () => ({
	resolveCurrentOrigin: vi.fn(),
}));

const mocked = vi.mocked(resolveCurrentOrigin);

describe("originForCwd", () => {
	beforeEach(() => {
		mocked.mockReset();
	});

	it("returns undefined without resolving when cwd is missing", () => {
		expect(originForCwd(undefined)).toBeUndefined();
		expect(mocked).not.toHaveBeenCalled();
	});

	it("resolves the origin for a cwd", () => {
		mocked.mockReturnValue({ origin: "host/org/repo", stable: true });
		expect(originForCwd("/repo/a")).toBe("host/org/repo");
	});

	it("memoises per cwd so git is only shelled once", () => {
		mocked.mockReturnValue({ origin: "host/org/repo", stable: true });
		originForCwd("/repo/memo");
		originForCwd("/repo/memo");
		expect(mocked).toHaveBeenCalledTimes(1);
	});

	it("retries a cwd whose origin came from a failed remote lookup", () => {
		mocked.mockReturnValueOnce({ origin: "local:/repo/flaky", stable: false });
		expect(originForCwd("/repo/flaky")).toBe("local:/repo/flaky");

		mocked.mockReturnValueOnce({ origin: "host/org/flaky", stable: true });
		expect(originForCwd("/repo/flaky")).toBe("host/org/flaky");
		expect(mocked).toHaveBeenCalledTimes(2);
	});

	it("memoises a remote-less repo, whose local key is not a guess", () => {
		mocked.mockReturnValue({ origin: "local:/repo/bare", stable: true });
		originForCwd("/repo/bare");
		originForCwd("/repo/bare");
		expect(mocked).toHaveBeenCalledTimes(1);
	});

	it("reports a cached resolution as stable", () => {
		mocked.mockReturnValue({ origin: "host/org/repo", stable: true });
		originResolutionForCwd("/repo/stable");
		expect(originResolutionForCwd("/repo/stable")).toEqual({
			origin: "host/org/repo",
			stable: true,
		});
	});
});
