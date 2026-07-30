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
		onChange,
	}: {
		value: string;
		language?: string;
		readOnly?: boolean;
		onChange?: (value: string) => void;
	}) => (
		<textarea
			data-testid="editor"
			data-language={language ?? ""}
			data-read-only={String(Boolean(readOnly))}
			value={value}
			onChange={(event) => onChange?.(event.target.value)}
		/>
	),
}));

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

type SaveResponse = {
	ok: boolean;
	status: number;
	body: Record<string, unknown>;
};

function stubContent(content: string, save?: SaveResponse) {
	const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
		if (init?.method === "POST" && save)
			return { ok: save.ok, status: save.status, json: async () => save.body };
		return { ok: true, status: 200, json: async () => ({ content }) };
	});
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
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

async function findEditor(): Promise<HTMLTextAreaElement> {
	return (await screen.findByTestId("editor")) as HTMLTextAreaElement;
}

function editorValue(): string {
	return (screen.getByTestId("editor") as HTMLTextAreaElement).value;
}

function postCall(fetchMock: ReturnType<typeof stubContent>) {
	const call = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
	if (!call) throw new Error("no save request was sent");
	return { url: call[0], body: JSON.parse(String(call[1]?.body)) };
}

describe("FileView", () => {
	it("renders the file in the editor", async () => {
		stubContent("const a = 1;\nconst b = 2;\n");

		renderView("/file?path=src/a.ts");

		expect((await findEditor()).value).toBe("const a = 1;\nconst b = 2;\n");
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

	it("opens the editor for editing", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");

		expect((await findEditor()).dataset.readOnly).toBe("false");
	});

	it("keeps edits in the buffer", async () => {
		stubContent("const a = 1;\n");

		renderView("/file?path=src/a.ts");

		fireEvent.change(await findEditor(), {
			target: { value: "const a = 2;\n" },
		});

		expect(editorValue()).toBe("const a = 2;\n");
	});

	it("saves the buffer and replaces it with the formatted text", async () => {
		const fetchMock = stubContent("const  a =1\n", {
			ok: true,
			status: 200,
			body: { content: "const a = 2;\n" },
		});

		renderView("/file?path=src/a.ts");

		fireEvent.change(await findEditor(), {
			target: { value: "const  a =2\n" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() => expect(editorValue()).toBe("const a = 2;\n"));
		const { url, body } = postCall(fetchMock);
		expect(url).toContain("path=src%2Fa.ts");
		expect(body).toEqual({ content: "const  a =2\n" });
	});

	it("saves on ctrl+s", async () => {
		const fetchMock = stubContent("const a = 1;\n", {
			ok: true,
			status: 200,
			body: { content: "const a = 1;\n" },
		});

		renderView("/file?path=src/a.ts");
		await findEditor();

		fireEvent.keyDown(document, { key: "s", ctrlKey: true });

		await waitFor(() =>
			expect(postCall(fetchMock).body).toEqual({
				content: "const a = 1;\n",
			}),
		);
	});

	it("reports a failed save and keeps the buffer", async () => {
		stubContent("const a = 1;\n", {
			ok: false,
			status: 400,
			body: { error: "Path outside cwd" },
		});

		renderView("/file?path=src/a.ts");

		fireEvent.change(await findEditor(), {
			target: { value: "const a = 2;\n" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		expect(await screen.findByText("Path outside cwd")).toBeTruthy();
		expect(editorValue()).toBe("const a = 2;\n");
	});

	it("toggles markdown between raw and rendered", async () => {
		stubContent("# Title\n");

		renderView("/file?path=docs/a.md");

		expect((await findEditor()).value).toBe("# Title\n");
		expect(screen.queryByTestId("markdown")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Rendered" }));

		expect(screen.getByTestId("markdown").textContent).toBe("# Title\n");
		expect(editor()).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Raw" }));

		expect(screen.queryByTestId("markdown")).toBeNull();
		expect(editorValue()).toBe("# Title\n");
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
