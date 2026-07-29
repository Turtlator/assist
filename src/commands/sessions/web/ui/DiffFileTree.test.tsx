// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { FileData } from "react-diff-view";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DiffFileTree } from "./DiffFileTree";

afterEach(cleanup);

function file(path: string): FileData {
	return {
		oldPath: path,
		newPath: path,
		type: "modify",
		hunks: [],
	} as unknown as FileData;
}

describe("DiffFileTree", () => {
	it("renders collapsed directory chains and reports the clicked file key", () => {
		const onSelectFile = vi.fn();
		render(
			<DiffFileTree
				files={[file("src/web/ui/App.tsx")]}
				onSelectFile={onSelectFile}
			/>,
		);

		expect(screen.getByText("src/web/ui")).toBeTruthy();
		fireEvent.click(screen.getByText("App.tsx"));

		expect(onSelectFile).toHaveBeenCalledWith("src/web/ui/App.tsx");
	});

	it("hides a directory's files while it is collapsed", () => {
		render(
			<DiffFileTree files={[file("src/app.ts")]} onSelectFile={vi.fn()} />,
		);

		fireEvent.click(screen.getByText("src"));
		expect(screen.queryByText("app.ts")).toBeNull();

		fireEvent.click(screen.getByText("src"));
		expect(screen.getByText("app.ts")).toBeTruthy();
	});

	it("shows each file's added and removed line counts", () => {
		render(
			<DiffFileTree
				files={[
					{
						oldPath: "src/app.ts",
						newPath: "src/app.ts",
						type: "modify",
						hunks: [
							{
								changes: [
									{ type: "insert" },
									{ type: "insert" },
									{ type: "insert" },
									{ type: "delete" },
								],
							},
						],
					} as unknown as FileData,
				]}
				onSelectFile={vi.fn()}
			/>,
		);

		expect(screen.getByText("+3")).toBeTruthy();
		expect(screen.getByText("-1")).toBeTruthy();
	});

	it("renders nothing when no files are in the diff", () => {
		const { container } = render(
			<DiffFileTree files={[]} onSelectFile={vi.fn()} />,
		);

		expect(container.firstChild).toBeNull();
	});
});
