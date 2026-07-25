// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MarkdownPreviewDialog } from "./MarkdownPreviewDialog";

vi.mock("../../../backlog/web/ui/components/MarkdownBlock", () => ({
	MarkdownBlock: ({ content, wide }: { content: string; wide?: boolean }) => (
		<div data-wide={wide ? "true" : "false"}>{content}</div>
	),
}));

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function stubFetch(response: Partial<Response>) {
	const fetch = vi.fn().mockResolvedValue(response);
	vi.stubGlobal("fetch", fetch);
	return fetch;
}

describe("MarkdownPreviewDialog", () => {
	it("reports a file that vanished from the working tree", async () => {
		stubFetch({ ok: false, status: 404 });

		render(
			<MarkdownPreviewDialog
				cwd="/repo"
				path="docs/gone.md"
				onClose={vi.fn()}
			/>,
		);

		expect(
			await screen.findByText("This file is no longer in the working tree."),
		).toBeTruthy();
	});

	it("reports a server error", async () => {
		stubFetch({ ok: false, status: 500 });

		render(
			<MarkdownPreviewDialog cwd="/repo" path="docs/a.md" onClose={vi.fn()} />,
		);

		expect(await screen.findByText("Couldn't load this file.")).toBeTruthy();
	});

	it("reports an error when the fetch rejects", async () => {
		const fetch = vi.fn().mockRejectedValue(new Error("offline"));
		vi.stubGlobal("fetch", fetch);

		render(
			<MarkdownPreviewDialog cwd="/repo" path="docs/a.md" onClose={vi.fn()} />,
		);

		expect(await screen.findByText("Couldn't load this file.")).toBeTruthy();
	});

	it("reports an error when no cwd is known and does not fetch", () => {
		const fetch = stubFetch({ ok: true, status: 200 });

		render(
			<MarkdownPreviewDialog
				cwd={undefined}
				path="docs/a.md"
				onClose={vi.fn()}
			/>,
		);

		expect(screen.getByText("Couldn't load this file.")).toBeTruthy();
		expect(fetch).not.toHaveBeenCalled();
	});

	it("reports an error when the payload has no content", async () => {
		stubFetch({ ok: true, status: 200, json: async () => ({}) } as Response);

		render(
			<MarkdownPreviewDialog cwd="/repo" path="docs/a.md" onClose={vi.fn()} />,
		);

		expect(await screen.findByText("Couldn't load this file.")).toBeTruthy();
	});

	it("renders the file content unclamped", async () => {
		stubFetch({
			ok: true,
			status: 200,
			json: async () => ({ content: "# Title" }),
		} as Response);

		render(
			<MarkdownPreviewDialog cwd="/repo" path="docs/a.md" onClose={vi.fn()} />,
		);

		const block = await screen.findByText("# Title");
		expect(block.dataset.wide).toBe("true");
	});
});
