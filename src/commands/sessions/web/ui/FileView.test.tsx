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

vi.mock("./MonacoEditor", () => ({
	MonacoEditor: ({
		value,
		language,
		readOnly,
	}: {
		value: string;
		language?: string;
		readOnly?: boolean;
	}) => (
		<div
			data-testid="editor"
			data-language={language ?? ""}
			data-read-only={String(Boolean(readOnly))}
		>
			{value}
		</div>
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

function editor(): HTMLElement | null {
	return screen.queryByTestId("editor");
}

async function findEditor(): Promise<HTMLElement> {
	return screen.findByTestId("editor");
}

describe("FileView", () => {
	it("renders the file in the editor", async () => {
		stubContent("const a = 1;\nconst b = 2;\n");

		renderView("/file?path=src/a.ts");

		const view = await findEditor();
		expect(view.textContent).toBe("const a = 1;\nconst b = 2;\n");
	});

	it("resolves the editor language from the extension", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");

		expect((await findEditor()).dataset.language).toBe("typescript");
	});

	it("leaves the language unset for an unknown extension", async () => {
		stubContent("plain\n");

		renderView("/file?path=notes.unknownext");

		expect((await findEditor()).dataset.language).toBe("");
	});

	it("opens the editor read-only", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");

		expect((await findEditor()).dataset.readOnly).toBe("true");
	});

	it("toggles markdown between raw and rendered", async () => {
		stubContent("# Title\n");

		renderView("/file?path=docs/a.md");

		expect((await findEditor()).textContent).toBe("# Title\n");
		expect(screen.queryByTestId("markdown")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Rendered" }));

		expect(screen.getByTestId("markdown").textContent).toBe("# Title\n");
		expect(editor()).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Raw" }));

		expect(screen.queryByTestId("markdown")).toBeNull();
		expect(editor()?.textContent).toBe("# Title\n");
	});

	it("offers no toggle for non-markdown files", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");

		await findEditor();
		expect(screen.queryByRole("button", { name: "Rendered" })).toBeNull();
	});

	it("offers a close button for markdown files", async () => {
		stubContent("# Title\n");

		renderView("/file?path=docs/a.md");

		await findEditor();
		expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
	});

	it("offers a close button for non-markdown files", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");

		await findEditor();
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
		await waitFor(() => expect(editor()).toBeNull());
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
