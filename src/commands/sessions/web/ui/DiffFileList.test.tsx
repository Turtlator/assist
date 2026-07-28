// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { FileData } from "react-diff-view";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DiffFileList } from "./DiffFileList";

vi.mock("./FileDiffBody", () => ({
	FileDiffBody: () => <div>diff body</div>,
}));

afterEach(cleanup);

function file(newRevision: string): FileData {
	return {
		hunks: [],
		oldEndingNewLine: true,
		newEndingNewLine: true,
		oldMode: "100644",
		newMode: "100644",
		oldRevision: "aaa",
		newRevision,
		oldPath: "src/app.ts",
		newPath: "src/app.ts",
		type: "modify",
	} as FileData;
}

describe("DiffFileList", () => {
	it("keeps a file collapsed when a refresh changes its blob revisions", () => {
		const { rerender } = render(
			<DiffFileList
				files={[file("bbb")]}
				viewType="unified"
				cwd="/repo"
				emptyMessage="No changes"
			/>,
		);
		fireEvent.click(screen.getByText("src/app.ts"));
		expect(screen.queryByText("diff body")).toBeNull();

		rerender(
			<DiffFileList
				files={[file("ccc")]}
				viewType="unified"
				cwd="/repo"
				emptyMessage="No changes"
			/>,
		);

		expect(screen.queryByText("diff body")).toBeNull();
	});
});
