import { describe, expect, it } from "vitest";
import { rankFilePaths } from "./rankFilePaths";

const paths = [
	"src/commands/sessions/web/ui/useDaemonState.ts",
	"src/commands/sessions/web/ui/useDiff.ts",
	"src/commands/sessions/daemon/state.ts",
	"README.md",
];

describe("rankFilePaths", () => {
	it("drops paths that do not match and ranks the basename hit first", () => {
		const ranked = rankFilePaths(paths, "uds", 20);
		expect(ranked[0]).toBe("src/commands/sessions/web/ui/useDaemonState.ts");
		expect(ranked).not.toContain("README.md");
	});

	it("returns every path for an empty query, sorted by path", () => {
		expect(rankFilePaths(paths, "", 20)).toEqual([...paths].sort());
	});

	it("caps the result count at the limit", () => {
		expect(rankFilePaths(paths, "", 2)).toHaveLength(2);
	});

	it("puts basename matches ahead of path-only matches", () => {
		expect(rankFilePaths(paths, "state", 20)[0]).toBe(
			"src/commands/sessions/daemon/state.ts",
		);
	});
});
