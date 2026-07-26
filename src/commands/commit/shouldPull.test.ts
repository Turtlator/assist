import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUpstreamBranch = vi.fn();

vi.mock("../../shared/upstreamBranch", () => ({
	upstreamBranch: () => mockUpstreamBranch(),
}));

import type { AssistConfig } from "../../shared/types";
import { shouldPull } from "./shouldPull";

const configWithPull = (pull: boolean): AssistConfig =>
	({ commit: { pull } }) as AssistConfig;

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("shouldPull", () => {
	describe("when the branch tracks an upstream", () => {
		it("should pull", () => {
			mockUpstreamBranch.mockReturnValue("main");

			expect(shouldPull(configWithPull(true))).toBe(true);
		});
	});

	describe("when the branch has no upstream", () => {
		it("should skip the pull rather than let git abort the commit", () => {
			mockUpstreamBranch.mockReturnValue(null);

			expect(shouldPull(configWithPull(true))).toBe(false);
		});
	});

	describe("when pulling is not configured", () => {
		it("should not pull and should not probe git", () => {
			expect(shouldPull(configWithPull(false))).toBe(false);
			expect(mockUpstreamBranch).not.toHaveBeenCalled();
		});
	});
});
