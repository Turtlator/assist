// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { unclampSvgWidth } from "./unclampSvgWidth";

function container(html: string): HTMLElement {
	const target = document.createElement("div");
	target.innerHTML = html;
	return target;
}

describe("unclampSvgWidth", () => {
	it("pins the natural width so a wide diagram can overflow", () => {
		const target = container(
			'<svg width="100%" style="max-width: 1440.5px;"></svg>',
		);

		unclampSvgWidth(target);

		const svg = target.querySelector("svg");
		expect(svg?.style.width).toBe("1440.5px");
		expect(svg?.style.maxWidth).toBe("none");
	});

	it("leaves an svg without a max width alone", () => {
		const target = container('<svg width="200" height="100"></svg>');

		unclampSvgWidth(target);

		expect(target.querySelector("svg")?.style.width).toBe("");
	});

	it("ignores a source fallback with no svg", () => {
		const target = container("<pre>graph TD</pre>");

		expect(() => unclampSvgWidth(target)).not.toThrow();
	});
});
