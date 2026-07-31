import { describe, expect, it } from "vitest";
import { isBacklogRunArgs } from "./isBacklogRunArgs";

describe("isBacklogRunArgs", () => {
	it("recognises a run of a prefixed or bare item id", () => {
		expect(isBacklogRunArgs(["backlog", "run", "a825"])).toBe(true);
		expect(isBacklogRunArgs(["backlog", "run", "825"])).toBe(true);
		expect(isBacklogRunArgs(["backlog", "run", "--write", "a825"])).toBe(true);
	});

	it("rejects a run with no item id", () => {
		expect(isBacklogRunArgs(["backlog", "run"])).toBe(false);
		expect(isBacklogRunArgs(["backlog", "run", "--write"])).toBe(false);
	});

	it("rejects other commands", () => {
		expect(isBacklogRunArgs(["backlog", "view", "a825"])).toBe(false);
		expect(isBacklogRunArgs(["review", "412"])).toBe(false);
		expect(isBacklogRunArgs([])).toBe(false);
	});
});
