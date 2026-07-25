import { describe, expect, it } from "vitest";
import { diffQuery } from "./diffQuery";

describe("diffQuery", () => {
	it("encodes the cwd on its own when there is no session", () => {
		expect(diffQuery("/git/repo-2")).toBe("cwd=%2Fgit%2Frepo-2");
	});

	it("adds the session id when one is given", () => {
		expect(diffQuery("/git/repo-2", "sess-1")).toBe(
			"cwd=%2Fgit%2Frepo-2&session=sess-1",
		);
	});
});
