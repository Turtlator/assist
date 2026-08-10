import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { underTempRoot } from "./underTempRoot";

describe("underTempRoot", () => {
	it("recognises a path inside the OS temp directory", () => {
		expect(
			underTempRoot(join(tmpdir(), "clone-collision-ABC/real/myrepo-2")),
		).toBe(true);
	});

	it("leaves an ordinary project path alone", () => {
		expect(underTempRoot("/home/dev/git/myrepo-2")).toBe(false);
	});

	it("does not treat a sibling of the temp directory as inside it", () => {
		expect(underTempRoot(`${tmpdir()}-other/myrepo-2`)).toBe(false);
	});
});
