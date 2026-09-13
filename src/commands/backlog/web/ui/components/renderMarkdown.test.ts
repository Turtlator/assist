import { describe, expect, it } from "vitest";
import { renderMarkdown, renderMarkdownInline } from "./renderMarkdown";

describe("renderMarkdown", () => {
	it("opens external links in a new tab", () => {
		const html = renderMarkdown("See [the mock](https://example.com/mock).");
		expect(html).toContain('href="https://example.com/mock"');
		expect(html).toContain('target="_blank"');
		expect(html).toContain('rel="noopener noreferrer"');
	});

	it("leaves relative links in the current tab", () => {
		const html = renderMarkdown("See [item](/items/a994).");
		expect(html).toContain('href="/items/a994"');
		expect(html).not.toContain("target=");
		expect(html).not.toContain("rel=");
	});

	it("opens protocol-relative links in a new tab", () => {
		const html = renderMarkdownInline("[mock](//example.com/mock)");
		expect(html).toContain('target="_blank"');
		expect(html).toContain('rel="noopener noreferrer"');
	});

	it("keeps link text and titles", () => {
		const html = renderMarkdownInline(
			'[the **mock**](https://example.com "Design")',
		);
		expect(html).toContain("<strong>mock</strong>");
		expect(html).toContain('title="Design"');
	});
});
