// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FileView } from "./FileView";
import { RepoSelectionContext } from "./useRepoSelectionContext";

vi.mock("../../../backlog/web/ui/components/MarkdownBlock", () => ({
	MarkdownBlock: ({ content }: { content: string }) => (
		<div data-testid="markdown">{content}</div>
	),
}));

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function stubContent(content: string) {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ content }),
		}),
	);
}

function renderView(entry: string, selectedCwd = "/repo") {
	render(
		<MemoryRouter initialEntries={[entry]}>
			<RepoSelectionContext.Provider
				value={{ repos: [], selectedCwd, setSelectedCwd: vi.fn() }}
			>
				<FileView />
			</RepoSelectionContext.Provider>
		</MemoryRouter>,
	);
}

function gutter(): string[] {
	return [...document.querySelectorAll(".file-line-number")].map(
		(node) => node.textContent ?? "",
	);
}

function bodyLines(): string[] {
	return [...document.querySelectorAll(".file-line-text")].map(
		(node) => node.textContent ?? "",
	);
}

async function waitForBody(): Promise<void> {
	await waitFor(() => expect(bodyLines().length).toBeGreaterThan(0));
}

describe("FileView", () => {
	it("renders the file with a line-number gutter", async () => {
		stubContent("const a = 1;\nconst b = 2;\n");

		renderView("/file?path=src/a.ts");

		await waitForBody();
		expect(bodyLines()).toEqual(["const a = 1;", "const b = 2;"]);
		expect(gutter()).toEqual(["1", "2"]);
	});

	it("syntax highlights the body", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");

		await waitForBody();
		expect(document.querySelector(".token.keyword")?.textContent).toBe("const");
		expect(document.querySelector(".token.number")?.textContent).toBe("1");
	});

	it("toggles markdown between raw and rendered", async () => {
		stubContent("# Title\n");

		renderView("/file?path=docs/a.md");

		await waitForBody();
		expect(bodyLines()).toEqual(["# Title"]);
		expect(screen.queryByTestId("markdown")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Rendered" }));

		expect(screen.getByTestId("markdown").textContent).toBe("# Title\n");
		expect(bodyLines()).toEqual([]);

		fireEvent.click(screen.getByRole("button", { name: "Raw" }));

		expect(screen.queryByTestId("markdown")).toBeNull();
		expect(gutter()).toEqual(["1"]);
	});

	it("offers no toggle for non-markdown files", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");

		await waitForBody();
		expect(screen.queryByRole("button", { name: "Rendered" })).toBeNull();
	});

	it("offers a close button for markdown files", async () => {
		stubContent("# Title\n");

		renderView("/file?path=docs/a.md");

		await waitForBody();
		expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
	});

	it("offers a close button for non-markdown files", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");

		await waitForBody();
		expect(screen.queryByRole("button", { name: "Rendered" })).toBeNull();
		expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
	});

	it("asks for a repo when none is selected", () => {
		renderView("/file?path=src/a.ts", "");

		expect(screen.getByText("Select a repo to view files.")).toBeTruthy();
	});

	it("reports a missing file", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: false, status: 404 }),
		);

		renderView("/file?path=src/gone.ts");

		expect(
			await screen.findByText("This file is not in the working tree."),
		).toBeTruthy();
	});

	it("reports a file that is too large", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: false, status: 413 }),
		);

		renderView("/file?path=src/huge.ts");

		expect(
			await screen.findByText("This file is too large to display (over 2 MB)."),
		).toBeTruthy();
	});
});
