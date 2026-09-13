import { describe, expect, it } from "vitest";
import { splitMarkdownSegments } from "./splitMarkdownSegments";

describe("splitMarkdownSegments", () => {
	it("opens external links in a new tab", () => {
		const [segment] = splitMarkdownSegments(
			"See [the mock](https://example.com/mock).",
		);
		expect(segment).toMatchObject({ type: "html" });
		expect(segment.type === "html" && segment.html).toContain(
			'target="_blank" rel="noopener noreferrer"',
		);
	});

	it("leaves relative links in the current tab", () => {
		const [segment] = splitMarkdownSegments("See [item](/items/a994).");
		expect(segment.type === "html" && segment.html).toContain(
			'<a href="/items/a994">',
		);
	});

	it("splits mermaid blocks out and keeps link handling either side", () => {
		const segments = splitMarkdownSegments(
			"[before](https://example.com/a)\n\n```mermaid\ngraph TD;A-->B;\n```\n\n[after](https://example.com/b)",
		);
		expect(segments.map((s) => s.type)).toEqual(["html", "mermaid", "html"]);
		for (const segment of segments) {
			if (segment.type === "html")
				expect(segment.html).toContain('target="_blank"');
		}
	});
});
