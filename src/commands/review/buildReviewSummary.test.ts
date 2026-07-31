import { describe, expect, it } from "vitest";
import { buildReviewSummary } from "./buildReviewSummary";
import type { UnanchoredFinding } from "./partitionFindings";

const UNANCHORED_HEADING = "### Findings not anchored to the diff";

function unanchored(
	overrides: Partial<UnanchoredFinding> = {},
): UnanchoredFinding {
	return {
		title: "Stale doc summary",
		severity: "major",
		source: "confirmed",
		location: "docs/notes.md:5",
		impact: "Readers trust the wrong description.",
		recommendation: "Rewrite the summary paragraph.",
		reason: "out-of-diff",
		...overrides,
	};
}

function unanchoredSection(out: string): string {
	const index = out.indexOf(UNANCHORED_HEADING);
	return index === -1 ? "" : out.slice(index);
}

const SAMPLE = `# Code review synthesis

## Summary

The change adds X. One blocker around null handling and a few minors.

## Findings

### Finding: Null pointer dereference
- Severity: blocker
- Source: confirmed
- Location: \`src/foo.ts:42\`
- Impact: Crash on null input.
- Recommendation: Add a null guard.

### Finding: Missing log
- Severity: minor
- Source: claude-only
- Location: \`n/a\`
- Impact: Harder to debug.
- Recommendation: Add a debug log.
`;

describe("buildReviewSummary", () => {
	it("includes the count line, summary text, and a finding bullet per finding", () => {
		const out = buildReviewSummary(SAMPLE);
		expect(out).toContain("## Code review summary");
		expect(out).toContain("Findings: 2 (blocker 1, major 0, minor 1, nit 0)");
		expect(out).toContain("The change adds X.");
		expect(out).toContain("### Findings");
		expect(out).toContain("- **blocker: Null pointer dereference**");
		expect(out).toContain("- **minor: Missing log**");
	});

	it("omits the findings section when there are none", () => {
		const out = buildReviewSummary("## Summary\n\nNothing to flag.\n");
		expect(out).toContain("Nothing to flag.");
		expect(out).not.toContain("### Findings");
	});

	it("falls back to 'finding' when severity is missing or unknown", () => {
		const md =
			"## Summary\n\nx\n\n### Finding: weird\n- Severity: weird\n- Location: `n/a`\n";
		expect(buildReviewSummary(md)).toContain("- **finding: weird**");
	});

	describe("the un-anchored findings section", () => {
		it("omits the section when nothing was carried", () => {
			expect(buildReviewSummary(SAMPLE)).not.toContain(UNANCHORED_HEADING);
		});

		it("renders an out-of-diff finding with location, reason, impact and recommendation", () => {
			const section = unanchoredSection(
				buildReviewSummary(SAMPLE, [unanchored()]),
			);

			expect(section).toContain(
				"- **major: Stale doc summary** — `docs/notes.md:5`",
			);
			expect(section).toContain(
				"  - Not anchored: its line falls outside the PR diff",
			);
			expect(section).toContain(
				"  - Impact: Readers trust the wrong description.",
			);
			expect(section).toContain(
				"  - Recommendation: Rewrite the summary paragraph.",
			);
		});

		it("marks an unlocated finding as having no location", () => {
			const section = unanchoredSection(
				buildReviewSummary(SAMPLE, [
					unanchored({
						title: "Missing log",
						severity: "minor",
						location: "n/a",
						reason: "unlocated",
					}),
				]),
			);

			expect(section).toContain("- **minor: Missing log** — no location");
			expect(section).toContain(
				"  - Not anchored: it has no parseable file:line",
			);
		});

		it("treats an empty location as no location", () => {
			const section = unanchoredSection(
				buildReviewSummary(SAMPLE, [
					unanchored({ location: "", reason: "unlocated" }),
				]),
			);

			expect(section).toContain("- **major: Stale doc summary** — no location");
		});

		it("excludes findings already raised by prior comments", () => {
			const out = buildReviewSummary(SAMPLE, [
				unanchored({
					title: "Prior comment covers this",
					source: "already-raised",
				}),
			]);

			expect(out).not.toContain(UNANCHORED_HEADING);
			expect(out).not.toContain("Prior comment covers this");
		});

		it("does not repeat findings that posted as line comments", () => {
			const section = unanchoredSection(
				buildReviewSummary(SAMPLE, [unanchored()]),
			);

			expect(section).not.toContain("Null pointer dereference");
			expect(section).not.toContain("Missing log");
		});

		it("keeps the section after the findings list", () => {
			const out = buildReviewSummary(SAMPLE, [unanchored()]);

			expect(out.indexOf("### Findings\n")).toBeLessThan(
				out.indexOf(UNANCHORED_HEADING),
			);
		});
	});
});
