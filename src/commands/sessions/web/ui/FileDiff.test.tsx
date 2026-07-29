// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FileData } from "react-diff-view";
import { FileDiff } from "./FileDiff";

vi.mock("./FileDiffBody", () => ({
	FileDiffBody: () => <div>diff body</div>,
}));

vi.mock("./MarkdownPreviewDialog", () => ({
	MarkdownPreviewDialog: () => <div>preview dialog</div>,
}));

afterEach(cleanup);

function markdownFile(
	type: FileData["type"],
	overrides: Partial<FileData> = {},
) {
	return {
		hunks: [],
		oldEndingNewLine: true,
		newEndingNewLine: true,
		oldMode: "100644",
		newMode: "100644",
		oldRevision: "aaa",
		newRevision: "bbb",
		oldPath: "docs/notes.md",
		newPath: "docs/notes.md",
		type,
		...overrides,
	} as FileData;
}

const previewName = { name: "Preview rendered markdown" };

describe("FileDiff", () => {
	it("offers a preview for a modified markdown file", () => {
		render(
			<FileDiff
				file={markdownFile("modify")}
				viewType="unified"
				cwd="/repo"
				collapsed={false}
				onToggle={() => {}}
			/>,
		);

		expect(screen.getByRole("button", previewName)).toBeTruthy();
	});

	it("offers no preview for a deleted markdown file", () => {
		render(
			<FileDiff
				file={markdownFile("delete", { newPath: "/dev/null" })}
				viewType="unified"
				cwd="/repo"
				collapsed={false}
				onToggle={() => {}}
			/>,
		);

		expect(screen.getByText("docs/notes.md")).toBeTruthy();
		expect(screen.queryByRole("button", previewName)).toBeNull();
	});

	it("hides the diff body when the parent says it is collapsed", () => {
		render(
			<FileDiff
				file={markdownFile("modify")}
				viewType="unified"
				cwd="/repo"
				collapsed
				onToggle={() => {}}
			/>,
		);

		expect(screen.queryByText("diff body")).toBeNull();
	});

	it("asks the parent to toggle when the header is clicked", () => {
		const onToggle = vi.fn();
		render(
			<FileDiff
				file={markdownFile("modify")}
				viewType="unified"
				cwd="/repo"
				collapsed={false}
				onToggle={onToggle}
			/>,
		);

		fireEvent.click(screen.getByText("docs/notes.md"));

		expect(onToggle).toHaveBeenCalledOnce();
	});
});
