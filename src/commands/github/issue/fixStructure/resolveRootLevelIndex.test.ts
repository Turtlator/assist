import { describe, expect, it } from "vitest";
import { resolveRootLevelIndex } from "./resolveRootLevelIndex";
import { defaultTypeChain } from "./types";

const chain = defaultTypeChain;

describe("resolveRootLevelIndex", () => {
	it("infers the level from the target's own type", () => {
		expect(resolveRootLevelIndex(chain, "Story", undefined)).toEqual({
			index: 1,
			asserted: false,
		});
	});

	it("infers loosely so Sub-task binds to the leaf level", () => {
		expect(resolveRootLevelIndex(chain, "Sub-task", undefined)).toEqual({
			index: 2,
			asserted: false,
		});
	});

	it("names the type it has when that type is not in the chain", () => {
		expect(() => resolveRootLevelIndex(chain, "Feature", undefined)).toThrow(
			/has the type Feature/,
		);
		expect(() => resolveRootLevelIndex(chain, "Feature", undefined)).toThrow(
			/--level epic\|story\|subtask/,
		);
	});

	it("names the absent type for an untyped target", () => {
		expect(() => resolveRootLevelIndex(chain, null, undefined)).toThrow(
			/has no issue type/,
		);
	});

	it("takes --level as an assertion that overrides the type", () => {
		expect(resolveRootLevelIndex(chain, "Feature", "epic")).toEqual({
			index: 0,
			asserted: true,
		});
		expect(resolveRootLevelIndex(chain, "Epic", "story")).toEqual({
			index: 1,
			asserted: true,
		});
	});

	it("refuses a --level that is not in the chain", () => {
		expect(() => resolveRootLevelIndex(chain, "Epic", "feature")).toThrow(
			/--level must name one of Epic, Story, Subtask/,
		);
	});
});
