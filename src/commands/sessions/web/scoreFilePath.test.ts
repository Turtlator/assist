import { describe, expect, it } from "vitest";
import { scoreFilePath } from "./scoreFilePath";

describe("scoreFilePath", () => {
	it("matches a camel-case initialism against the basename", () => {
		expect(
			scoreFilePath("src/commands/sessions/web/ui/useDaemonState.ts", "uds"),
		).not.toBeNull();
	});

	it("returns null when the query is not a subsequence", () => {
		expect(scoreFilePath("src/index.ts", "zzz")).toBeNull();
	});

	it("returns null when the characters appear out of order", () => {
		expect(scoreFilePath("src/alpha.ts", "hpla")).toBeNull();
	});

	it("scores every path equally for an empty query", () => {
		expect(scoreFilePath("src/index.ts", "")).toBe(0);
		expect(scoreFilePath("a/b/c.ts", "   ")).toBe(0);
	});

	it("ranks a basename match above a directory-path-only match", () => {
		const basenameHit = scoreFilePath("src/other/diff.ts", "diff");
		const pathHit = scoreFilePath("src/diff/renderer.ts", "diff");
		expect(basenameHit).not.toBeNull();
		expect(pathHit).not.toBeNull();
		expect(basenameHit as number).toBeGreaterThan(pathHit as number);
	});

	it("prefers a prefix match over a scattered basename match", () => {
		const prefix = scoreFilePath("src/listFiles.ts", "list");
		const scattered = scoreFilePath("src/loadInterestingSets.ts", "list");
		expect(prefix as number).toBeGreaterThan(scattered as number);
	});

	it("prefers a shorter basename when the match is otherwise equal", () => {
		const short = scoreFilePath("src/diff.ts", "diff");
		const long = scoreFilePath("src/diffToolbarActions.ts", "diff");
		expect(short as number).toBeGreaterThan(long as number);
	});

	it("is case insensitive", () => {
		expect(scoreFilePath("src/README.md", "readme")).not.toBeNull();
		expect(scoreFilePath("src/readme.md", "README")).not.toBeNull();
	});
});
