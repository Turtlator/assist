// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AcceptanceCriteriaList } from "./AcceptanceCriteriaList";
import { MarkdownBlock } from "./MarkdownBlock";

const content =
	"See [the mock](https://example.com/mock).\n\nSecond paragraph.";

describe("markdown anchors survive re-renders", () => {
	it("keeps the description anchor when mermaid splitting is on", () => {
		const { container, rerender } = render(
			<MarkdownBlock content={content} renderMermaid />,
		);
		const before = container.querySelector("a");
		expect(before).not.toBeNull();
		rerender(<MarkdownBlock content={content} renderMermaid />);
		expect(container.querySelector("a")).toBe(before);
	});

	it("keeps the description anchor when mermaid splitting is off", () => {
		const { container, rerender } = render(<MarkdownBlock content={content} />);
		const before = container.querySelector("a");
		rerender(<MarkdownBlock content={content} />);
		expect(container.querySelector("a")).toBe(before);
	});

	it("keeps acceptance criteria anchors", () => {
		const criteria = ["Check [the mock](https://example.com/mock)"];
		const { container, rerender } = render(
			<AcceptanceCriteriaList criteria={criteria} />,
		);
		const before = container.querySelector("a");
		expect(before).not.toBeNull();
		rerender(<AcceptanceCriteriaList criteria={criteria} />);
		expect(container.querySelector("a")).toBe(before);
	});
});
