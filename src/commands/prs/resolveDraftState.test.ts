import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadConfig = vi.fn();
vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

import { resolveDraftState } from "./resolveDraftState";

function commandWithSource(source: string | undefined) {
	return { getOptionValueSource: () => source };
}

beforeEach(() => {
	mockLoadConfig.mockReturnValue({});
});

describe("resolveDraftState", () => {
	describe("when no flag was supplied", () => {
		it("falls back to prs.draft when it is true", () => {
			mockLoadConfig.mockReturnValue({ prs: { draft: true } });

			expect(resolveDraftState({}, commandWithSource("default"))).toBe(true);
		});

		it("falls back to prs.draft when it is false", () => {
			mockLoadConfig.mockReturnValue({ prs: { draft: false } });

			expect(resolveDraftState({}, commandWithSource("default"))).toBe(false);
		});

		it("is false when prs.draft is unset", () => {
			expect(resolveDraftState({}, commandWithSource(undefined))).toBe(false);
		});

		it("ignores a defaulted option value that Commander set to true", () => {
			expect(
				resolveDraftState({ draft: true }, commandWithSource("default")),
			).toBe(false);
		});

		it("falls back to config when no command is available", () => {
			mockLoadConfig.mockReturnValue({ prs: { draft: true } });

			expect(resolveDraftState({})).toBe(true);
		});
	});

	describe("when a flag was supplied", () => {
		it("--draft wins over prs.draft false", () => {
			mockLoadConfig.mockReturnValue({ prs: { draft: false } });

			expect(resolveDraftState({ draft: true }, commandWithSource("cli"))).toBe(
				true,
			);
		});

		it("--no-draft wins over prs.draft true", () => {
			mockLoadConfig.mockReturnValue({ prs: { draft: true } });

			expect(
				resolveDraftState({ draft: false }, commandWithSource("cli")),
			).toBe(false);
		});
	});
});
