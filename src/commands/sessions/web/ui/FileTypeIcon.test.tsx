// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FileTypeIcon } from "./FileTypeIcon";

afterEach(cleanup);

function label(): string | undefined {
	return document.querySelector("text")?.textContent ?? undefined;
}

function fills(): string[] {
	return [...document.querySelectorAll("rect")].map(
		(node) => node.getAttribute("fill") ?? "",
	);
}

describe("FileTypeIcon", () => {
	it("labels the icon with the file extension", () => {
		render(<FileTypeIcon path="src/useDaemonState.ts" />);

		expect(label()).toBe("ts");
		expect(fills()).toContain("#3478C7");
	});

	it("styles aliased extensions like their base type", () => {
		render(<FileTypeIcon path="src/App.tsx" />);

		expect(label()).toBe("tsx");
		expect(fills()).toContain("#3478C7");
	});

	it("falls back to a generic icon for unknown extensions", () => {
		render(<FileTypeIcon path="src/data.abc" />);

		expect(label()).toBe("abc");
		expect(fills()).not.toContain("#3478C7");
	});

	it("omits the label when there is no short extension", () => {
		render(<FileTypeIcon path=".gitignore" />);

		expect(label()).toBeUndefined();
	});
});
