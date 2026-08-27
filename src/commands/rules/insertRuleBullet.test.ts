import { describe, expect, it } from "vitest";
import { insertRuleBullet } from "./insertRuleBullet";

describe("insertRuleBullet", () => {
	it("appends after the last bullet in an existing section", () => {
		const content =
			"# Doc\n\n## Rules\n\n- **R1** — First\n- **R2** — Second\n";

		expect(insertRuleBullet(content, "R3", "Third")).toBe(
			"# Doc\n\n## Rules\n\n- **R1** — First\n- **R2** — Second\n- **R3** — Third\n",
		);
	});

	it("creates the section when the file has none", () => {
		expect(insertRuleBullet("# Doc\n\nGuidance.\n", "R1", "First")).toBe(
			"# Doc\n\nGuidance.\n\n## Rules\n\n- **R1** — First\n",
		);
	});

	it("creates the section in an empty file", () => {
		expect(insertRuleBullet("", "R1", "First")).toBe(
			"## Rules\n\n- **R1** — First\n",
		);
	});

	it("keeps content that follows the section", () => {
		const content = "## Rules\n\n- **R1** — First\n\n## Other\n\nText.\n";

		expect(insertRuleBullet(content, "R2", "Second")).toBe(
			"## Rules\n\n- **R1** — First\n- **R2** — Second\n\n## Other\n\nText.\n",
		);
	});

	it("inserts before trailing prose when the section has no bullets", () => {
		const content = "## Rules\n\nNothing yet.\n";

		expect(insertRuleBullet(content, "R1", "First")).toBe(
			"## Rules\n\n- **R1** — First\n\nNothing yet.\n",
		);
	});
});
