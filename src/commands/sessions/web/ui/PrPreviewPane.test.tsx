// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrPreview } from "../../shared/SessionInfoBase";
import { PrPreviewPane } from "./PrPreviewPane";

if (!Range.prototype.getBoundingClientRect) {
	Range.prototype.getBoundingClientRect = () =>
		({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }) as DOMRect;
}
if (!Range.prototype.getClientRects) {
	Range.prototype.getClientRects = () =>
		({
			length: 0,
			item: () => null,
			[Symbol.iterator]: [][Symbol.iterator],
		}) as unknown as DOMRectList;
}
if (!URL.createObjectURL) {
	URL.createObjectURL = () => "blob:test";
}
if (!URL.revokeObjectURL) {
	URL.revokeObjectURL = () => {};
}

type CaretDoc = {
	caretRangeFromPoint?: ((x: number, y: number) => Range | null) | undefined;
	elementFromPoint?: ((x: number, y: number) => Element | null) | undefined;
};

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	(document as CaretDoc).caretRangeFromPoint = undefined;
	(document as CaretDoc).elementFromPoint = undefined;
	localStorage.clear();
});

const preview: PrPreview = {
	requestId: "r1",
	title: "feat: x",
	body: "## What\n\nAdds x to the thing",
	prNumber: null,
};

function caretAt(node: Node, offset: number): Range {
	const range = document.createRange();
	range.setStart(node, offset);
	range.collapse(true);
	return range;
}

function selectText(container: HTMLElement, text: string) {
	const root = container.querySelector(".markdown") as HTMLElement;
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	let node: Node | null = walker.nextNode();
	while (node) {
		const idx = (node.textContent ?? "").indexOf(text);
		if (idx !== -1) break;
		node = walker.nextNode();
	}
	if (!node) throw new Error(`text not found: ${text}`);
	const found = node;
	const idx = (found.textContent ?? "").indexOf(text);

	(document as CaretDoc).elementFromPoint = vi
		.fn()
		.mockReturnValue(found.parentElement as Element);
	(document as CaretDoc).caretRangeFromPoint = vi
		.fn()
		.mockReturnValueOnce(caretAt(found, idx))
		.mockReturnValue(caretAt(found, idx + text.length));

	fireEvent.mouseDown(root, { clientX: 1, clientY: 1 });
	act(() => {
		globalThis.dispatchEvent(
			new MouseEvent("mouseup", { clientX: 2, clientY: 1, bubbles: true }),
		);
	});
}

function addComment(container: HTMLElement, quote: string, note: string) {
	selectText(container, quote);
	fireEvent.change(screen.getByPlaceholderText("Add a note…"), {
		target: { value: note },
	});
	fireEvent.click(screen.getByRole("button", { name: "Add comment" }));
}

describe("PrPreviewPane inline comments", () => {
	it("attaches a selected span + note and sends them with a reject on Request changes", () => {
		const onDecision = vi.fn();
		const { container } = render(
			<PrPreviewPane preview={preview} onDecision={onDecision} />,
		);

		addComment(container, "Adds x", "say what x is");

		expect(screen.getByText("Comments (1)")).toBeTruthy();
		const mark = container.querySelector("mark.pr-comment");
		expect(mark?.textContent).toBe("Adds x");
		fireEvent.click(
			screen.getByRole("button", { name: /Request changes \(1\)/ }),
		);

		expect(onDecision).toHaveBeenCalledWith("reject", {
			comments: [{ quote: "Adds x", note: "say what x is" }],
			screenshots: [],
			reviewAfter: false,
			announceAfter: false,
		});
	});

	it("gives each highlighted span a distinct colour", () => {
		const { container } = render(
			<PrPreviewPane preview={preview} onDecision={vi.fn()} />,
		);

		addComment(container, "Adds x", "first");
		addComment(container, "the thing", "second");

		const marks = Array.from(
			container.querySelectorAll<HTMLElement>("mark.pr-comment"),
		);
		expect(marks).toHaveLength(2);
		expect(marks[0].style.backgroundColor).toBeTruthy();
		expect(marks[1].style.backgroundColor).toBeTruthy();
		expect(marks[0].style.backgroundColor).not.toBe(
			marks[1].style.backgroundColor,
		);
	});

	it("removes an attached comment", () => {
		const { container } = render(
			<PrPreviewPane preview={preview} onDecision={vi.fn()} />,
		);

		addComment(container, "Adds x", "say what x is");
		expect(screen.getByText("Comments (1)")).toBeTruthy();

		expect(container.querySelector("mark.pr-comment")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: "Remove comment" }));
		expect(screen.queryByText("Comments (1)")).toBeNull();
		expect(
			screen.queryByRole("button", { name: /Request changes/ }),
		).toBeNull();
		expect(container.querySelector("mark.pr-comment")).toBeNull();
	});

	it("plain Approve and Reject send no comments", () => {
		const onDecision = vi.fn();
		render(<PrPreviewPane preview={preview} onDecision={onDecision} />);

		fireEvent.click(screen.getByRole("button", { name: "Approve" }));
		expect(onDecision).toHaveBeenCalledWith("approve", {
			comments: [],
			screenshots: [],
			reviewAfter: true,
			announceAfter: true,
		});

		fireEvent.click(screen.getByRole("button", { name: "Reject" }));
		expect(onDecision).toHaveBeenCalledWith("reject", {
			comments: [],
			screenshots: [],
			reviewAfter: false,
			announceAfter: false,
		});
	});

	describe("Review and Post chain toggles", () => {
		const toggle = (label: string) =>
			screen.getByLabelText(label) as HTMLInputElement;
		const approve = () =>
			fireEvent.click(screen.getByRole("button", { name: "Approve" }));

		it("are both checked by default and approve with the whole chain on", () => {
			const onDecision = vi.fn();
			render(<PrPreviewPane preview={preview} onDecision={onDecision} />);

			expect(toggle("Review").checked).toBe(true);
			expect(toggle("Post").checked).toBe(true);

			approve();
			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({ reviewAfter: true, announceAfter: true }),
			);
		});

		it("keeps the announce when only Review is unchecked", () => {
			const onDecision = vi.fn();
			render(<PrPreviewPane preview={preview} onDecision={onDecision} />);

			fireEvent.click(toggle("Review"));
			expect(toggle("Review").checked).toBe(false);
			expect(toggle("Post").checked).toBe(true);

			approve();
			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({ reviewAfter: false, announceAfter: true }),
			);
		});

		it("keeps the review when only Post is unchecked", () => {
			const onDecision = vi.fn();
			render(<PrPreviewPane preview={preview} onDecision={onDecision} />);

			fireEvent.click(toggle("Post"));

			approve();
			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({ reviewAfter: true, announceAfter: false }),
			);
		});

		it("approves with nothing chained when both are unchecked", () => {
			const onDecision = vi.fn();
			render(<PrPreviewPane preview={preview} onDecision={onDecision} />);

			fireEvent.click(toggle("Review"));
			fireEvent.click(toggle("Post"));

			approve();
			expect(onDecision).toHaveBeenCalledWith(
				"approve",
				expect.objectContaining({ reviewAfter: false, announceAfter: false }),
			);
		});
	});

	it("restores persisted comments after a remount (page refresh)", () => {
		const first = render(
			<PrPreviewPane preview={preview} onDecision={vi.fn()} />,
		);
		addComment(first.container, "Adds x", "say what x is");
		expect(screen.getByText("Comments (1)")).toBeTruthy();

		first.unmount();

		render(<PrPreviewPane preview={preview} onDecision={vi.fn()} />);
		expect(screen.getByText("Comments (1)")).toBeTruthy();
		expect(screen.getByText("say what x is")).toBeTruthy();
	});

	function pasteImage(name: string) {
		const file = new File(["bytes"], name, { type: "image/png" });
		const event = new Event("paste", { bubbles: true }) as Event & {
			clipboardData: unknown;
		};
		event.clipboardData = {
			items: [{ kind: "file", type: "image/png", getAsFile: () => file }],
		};
		act(() => {
			globalThis.dispatchEvent(event);
		});
	}

	it("uploads a pasted screenshot and shows it in the Screenshots section", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ markdown: "![shot](https://x/y.png)" }),
		});
		vi.stubGlobal("fetch", fetchMock);

		render(
			<PrPreviewPane preview={preview} cwd="/repo" onDecision={vi.fn()} />,
		);
		pasteImage("shot.png");

		const img = (await screen.findByAltText("screenshot")) as HTMLImageElement;
		expect(img.getAttribute("src")).toMatch(/^blob:/);
		expect(screen.getByRole("heading", { name: "Screenshots" })).toBeTruthy();
		const url = fetchMock.mock.calls[0][0] as string;
		expect(url).toContain("/api/pr-preview/upload-image?");
		expect(url).toContain("cwd=%2Frepo");
	});

	type UploadResponse = { ok: boolean; json: () => Promise<unknown> };

	function deferredUpload() {
		let settle: (res: UploadResponse) => void = () => {};
		const promise = new Promise<UploadResponse>((resolve) => {
			settle = resolve;
		});
		return {
			promise,
			succeed: async (markdown: string) => {
				await act(async () => {
					settle({ ok: true, json: async () => ({ markdown }) });
				});
			},
			fail: async (error: string) => {
				await act(async () => {
					settle({ ok: false, json: async () => ({ error }) });
				});
			},
		};
	}

	function stubDeferredUploads() {
		const first = deferredUpload();
		const second = deferredUpload();
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockReturnValueOnce(first.promise)
				.mockReturnValueOnce(second.promise),
		);
		return { first, second };
	}

	const uploadingIndicators = () =>
		screen.queryAllByText("Uploading screenshot…");

	it("shows an indicator per in-flight upload and keeps them independent", async () => {
		const { first, second } = stubDeferredUploads();
		render(
			<PrPreviewPane preview={preview} cwd="/repo" onDecision={vi.fn()} />,
		);

		pasteImage("one.png");
		pasteImage("two.png");
		expect(uploadingIndicators()).toHaveLength(2);

		await first.succeed("![one](https://x/one.png)");
		expect(uploadingIndicators()).toHaveLength(1);
		expect(screen.getAllByAltText("screenshot")).toHaveLength(1);

		await second.succeed("![two](https://x/two.png)");
		expect(uploadingIndicators()).toHaveLength(0);
		const images = screen.getAllByAltText("screenshot") as HTMLImageElement[];
		expect(images).toHaveLength(2);
		expect(images.map((img) => img.getAttribute("src"))).toEqual([
			expect.stringMatching(/^blob:/),
			expect.stringMatching(/^blob:/),
		]);
	});

	it("reports one upload's failure without disturbing a concurrent upload", async () => {
		const { first, second } = stubDeferredUploads();
		render(
			<PrPreviewPane preview={preview} cwd="/repo" onDecision={vi.fn()} />,
		);

		pasteImage("one.png");
		pasteImage("two.png");

		await first.fail("gh image blew up");
		expect(screen.getByText("gh image blew up")).toBeTruthy();
		expect(uploadingIndicators()).toHaveLength(1);

		await second.succeed("![two](https://x/two.png)");
		expect(screen.getByText("gh image blew up")).toBeTruthy();
		expect(screen.getAllByAltText("screenshot")).toHaveLength(1);
	});

	it("appends uploaded screenshots to the decision on approve, but not reject", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ markdown: "![shot](https://x/y.png)" }),
			}),
		);
		const onDecision = vi.fn();
		render(
			<PrPreviewPane preview={preview} cwd="/repo" onDecision={onDecision} />,
		);
		pasteImage("shot.png");
		await screen.findByAltText("screenshot");

		fireEvent.click(screen.getByRole("button", { name: "Reject" }));
		expect(onDecision).toHaveBeenLastCalledWith("reject", {
			comments: [],
			screenshots: [],
			reviewAfter: false,
			announceAfter: false,
		});

		fireEvent.click(screen.getByRole("button", { name: "Approve" }));
		expect(onDecision).toHaveBeenLastCalledWith("approve", {
			comments: [],
			screenshots: ["![shot](https://x/y.png)"],
			reviewAfter: true,
			announceAfter: true,
		});
	});

	describe("backlog item previews", () => {
		const item: PrPreview = {
			requestId: "b1",
			title: "Preview never opens",
			body: "**Type:** bug\n\n## Description\n\nThe pane stays shut",
			prNumber: null,
			kind: "backlog-item",
			itemType: "bug",
		};

		it("shows a type chip instead of a PR chip", () => {
			render(<PrPreviewPane preview={item} onDecision={vi.fn()} />);

			expect(screen.getByText("Bug")).toBeTruthy();
			expect(screen.queryByText("New PR")).toBeNull();
		});

		it("shows a Story chip for a story", () => {
			render(
				<PrPreviewPane
					preview={{ ...item, itemType: "story" }}
					onDecision={vi.fn()}
				/>,
			);

			expect(screen.getByText("Story")).toBeTruthy();
		});

		it("offers no screenshot UI and ignores a pasted image", async () => {
			const fetchMock = vi.fn();
			vi.stubGlobal("fetch", fetchMock);

			render(<PrPreviewPane preview={item} cwd="/repo" onDecision={vi.fn()} />);
			expect(screen.queryByText(/attach a screenshot/)).toBeNull();

			pasteImage("shot.png");
			await Promise.resolve();

			expect(fetchMock).not.toHaveBeenCalled();
			expect(screen.queryByAltText("screenshot")).toBeNull();
		});

		it("supports drag-select inline commenting", () => {
			const onDecision = vi.fn();
			const { container } = render(
				<PrPreviewPane preview={item} onDecision={onDecision} />,
			);

			addComment(container, "stays shut", "which pane?");

			expect(container.querySelector("mark.pr-comment")?.textContent).toBe(
				"stays shut",
			);
			fireEvent.click(
				screen.getByRole("button", { name: /Request changes \(1\)/ }),
			);
			expect(onDecision).toHaveBeenCalledWith("reject", {
				comments: [{ quote: "stays shut", note: "which pane?" }],
				screenshots: [],
				reviewAfter: false,
				announceAfter: false,
			});
		});

		it("offers no chain toggles", () => {
			render(<PrPreviewPane preview={item} onDecision={vi.fn()} />);

			expect(screen.queryByLabelText("Review")).toBeNull();
			expect(screen.queryByLabelText("Post")).toBeNull();
		});
	});

	it("clears persisted comments once a decision is made", () => {
		const { container, unmount } = render(
			<PrPreviewPane preview={preview} onDecision={vi.fn()} />,
		);
		addComment(container, "Adds x", "say what x is");
		fireEvent.click(
			screen.getByRole("button", { name: /Request changes \(1\)/ }),
		);
		unmount();

		render(<PrPreviewPane preview={preview} onDecision={vi.fn()} />);
		expect(screen.queryByText("Comments (1)")).toBeNull();
	});
});
