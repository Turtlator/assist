import { describe, expect, it } from "vitest";
import { upsertScopedRulesPointer } from "./upsertScopedRulesPointer";

describe("upsertScopedRulesPointer", () => {
	it("adds the pointer at the end of the Rules section", () => {
		const content = "## Rules\n\n- **R1** — First\n\n## Other\n\nText.\n";

		expect(upsertScopedRulesPointer(content, ["work/"])).toBe(
			"## Rules\n\n- **R1** — First\n\nDirectories with their own `## Rules`: `work/`\n\n## Other\n\nText.\n",
		);
	});

	it("replaces an existing pointer rather than appending a second", () => {
		const content = upsertScopedRulesPointer("## Rules\n\n- **R1** — First\n", [
			"work/",
		]);

		expect(upsertScopedRulesPointer(content, ["refinement/", "work/"])).toBe(
			"## Rules\n\n- **R1** — First\n\nDirectories with their own `## Rules`: `refinement/`, `work/`\n",
		);
	});

	it("creates the section when the root has none", () => {
		expect(upsertScopedRulesPointer("# Doc\n", ["work/"])).toBe(
			"# Doc\n\n## Rules\n\nDirectories with their own `## Rules`: `work/`\n",
		);
	});

	it("leaves content untouched when there are no scoped directories", () => {
		const content = "## Rules\n\n- **R1** — First\n";

		expect(upsertScopedRulesPointer(content, [])).toBe(content);
	});

	it("removes the pointer when the last scoped directory goes away", () => {
		const content = upsertScopedRulesPointer("## Rules\n\n- **R1** — First\n", [
			"work/",
		]);

		expect(upsertScopedRulesPointer(content, [])).toBe(
			"## Rules\n\n- **R1** — First\n",
		);
	});

	it("is unchanged when the pointer already names the same directories", () => {
		const content = upsertScopedRulesPointer("## Rules\n\n- **R1** — First\n", [
			"work/",
		]);

		expect(upsertScopedRulesPointer(content, ["work/"])).toBe(content);
	});
});
