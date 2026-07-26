import { describe, expect, it } from "vitest";
import { deepMergeRawConfig } from "./deepMergeRawConfig";

describe("deepMergeRawConfig", () => {
	it("keeps sibling keys of an overridden nested key", () => {
		expect(
			deepMergeRawConfig(
				{ worktree: { trunk: true, copy: [".env"] } },
				{ worktree: { enabled: true } },
			),
		).toEqual({ worktree: { trunk: true, copy: [".env"], enabled: true } });
	});

	it("merges arbitrarily deep objects", () => {
		expect(
			deepMergeRawConfig(
				{ sessions: { web: { port: 4000, host: "0.0.0.0" } } },
				{ sessions: { web: { port: 5000 } } },
			),
		).toEqual({ sessions: { web: { port: 5000, host: "0.0.0.0" } } });
	});

	it("replaces arrays rather than concatenating them", () => {
		expect(
			deepMergeRawConfig(
				{ worktree: { copy: ["a", "b"] } },
				{
					worktree: { copy: ["c"] },
				},
			),
		).toEqual({ worktree: { copy: ["c"] } });
	});

	it("lets an override replace an object with a scalar", () => {
		expect(deepMergeRawConfig({ a: { b: 1 } }, { a: 2 })).toEqual({ a: 2 });
	});

	it("keeps an explicit null override", () => {
		expect(deepMergeRawConfig({ a: { b: 1 } }, { a: null })).toEqual({
			a: null,
		});
	});

	it("does not mutate its inputs", () => {
		const base = { worktree: { trunk: true } };
		const override = { worktree: { enabled: true } };
		deepMergeRawConfig(base, override);
		expect(base).toEqual({ worktree: { trunk: true } });
		expect(override).toEqual({ worktree: { enabled: true } });
	});
});
