import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runExtract } from "./runExtract";

const topLeftId = "3458764680658544387";
const bottomRightId = "3458764680658544425";

type RawItem = Record<string, unknown>;

function shape(
	id: string,
	content: string,
	x: number,
	y: number,
	width: number,
	height: number,
	type = "shape",
): RawItem {
	return {
		id,
		type,
		data: { shape: "round_rectangle", content },
		style: { fillColor: "#8f7fee" },
		geometry: { height, width },
		position: {
			origin: "center",
			relativeTo: "parent_top_left",
			x,
			y,
		},
		parent: { id: "3458764665701555761" },
		miro_url: `https://miro.com/app/board/uXjVGqQsR5Q=/?moveToWidget=${id}`,
	};
}

function page(items: RawItem[], hasMore: boolean, cursor: string | null) {
	return {
		data: items,
		total: 11,
		error_code: null,
		details: null,
		nextCursor: cursor,
		has_more: hasMore,
	};
}

const firstPage = page(
	[
		shape("banner", "<p><strong>Delivery</strong></p>", 650, 380, 1100, 80),
		shape("timeline", "<p><strong></strong></p>", 600, 500, 200, 100),
		{
			id: "march",
			type: "text",
			data: {
				content:
					'<p><span style="background-color:transparent">March</span></p>',
			},
			geometry: { width: 100 },
			position: {
				origin: "center",
				relativeTo: "parent_top_left",
				x: 500,
				y: 400,
			},
		},
		shape(topLeftId, "<p><strong>Alpha</strong></p>", 200, 400, 200, 100),
	],
	true,
	"MzQ1ODc2NDY2NTcwMTU1NTc3M34=",
);

const secondPage = page(
	[
		shape(
			"sticky",
			"<p>Sticky note idea</p>",
			400,
			700,
			200,
			100,
			"sticky_note",
		),
		shape(
			"beta",
			"<p><strong>Beta &amp; friends</strong></p>",
			800,
			400,
			200,
			100,
		),
		shape("gamma", "<p><strong>Gamma</strong></p>", 800, 600, 200, 100),
		shape("edge", "<p><strong>Edge</strong></p>", 1290, 700, 400, 100),
		shape(bottomRightId, "<p><strong>Omega</strong></p>", 1200, 900, 200, 100),
		shape("outside", "<p><strong>Outside</strong></p>", 2000, 400, 200, 100),
		{
			id: "logo",
			type: "image",
			data: { title: "logo.png" },
			geometry: { height: 100, width: 100 },
			position: {
				origin: "center",
				relativeTo: "parent_top_left",
				x: 900,
				y: 500,
			},
		},
	],
	false,
	null,
);

const expectedOrder = [
	"Delivery",
	"Alpha",
	"Sticky note idea",
	"Beta & friends",
	"Gamma",
	"Edge",
	"Omega",
];

let dir: string;
let written: string[];

function itemsFile(contents: string, name = "board-items.json"): string {
	const path = join(dir, name);
	writeFileSync(path, contents);
	return path;
}

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "miro-"));
	written = [];
	vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
		written.push(String(chunk));
		return true;
	});
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("runExtract", () => {
	describe("when given multi-page response pages", () => {
		it("should print the boxes as YAML, leftmost edge first", () => {
			const items = itemsFile(JSON.stringify([firstPage, secondPage]));

			runExtract({ items, topLeft: topLeftId, bottomRight: bottomRightId });

			expect(written.join("")).toBe(
				`${expectedOrder.map((text) => `- ${text}`).join("\n")}\n`,
			);
		});
	});

	describe("when the pages are stored one per line", () => {
		it("should read every page", () => {
			const items = itemsFile(
				`${JSON.stringify(firstPage)}\n${JSON.stringify(secondPage)}\n`,
				"board-items.jsonl",
			);

			runExtract({ items, topLeft: topLeftId, bottomRight: bottomRightId });

			expect(written.join("")).toBe(
				`${expectedOrder.map((text) => `- ${text}`).join("\n")}\n`,
			);
		});
	});

	describe("when the anchors are given as moveToWidget links", () => {
		it("should read the widget id out of the link", () => {
			const items = itemsFile(JSON.stringify([firstPage, secondPage]));

			runExtract({
				items,
				topLeft: `https://miro.com/app/board/uXjVGqQsR5Q=/?moveToWidget=${topLeftId}`,
				bottomRight: `https://miro.com/app/board/uXjVGqQsR5Q=/?moveToWidget=${bottomRightId}`,
			});

			expect(written.join("")).toBe(
				`${expectedOrder.map((text) => `- ${text}`).join("\n")}\n`,
			);
		});
	});

	describe("when an anchor id is not in the items", () => {
		it("should fail telling the caller to re-dump the frame", () => {
			const items = itemsFile(JSON.stringify([firstPage, secondPage]));

			expect(() =>
				runExtract({ items, topLeft: "missing", bottomRight: bottomRightId }),
			).toThrow(/No item with id missing.*Re-dump the frame/s);
		});
	});

	describe("when an item is not in frame coordinates", () => {
		it("should fail rather than mix coordinate spaces", () => {
			const canvasItem = shape("canvas", "<p>Stray</p>", 10, 10, 100, 100);
			canvasItem.position = {
				origin: "center",
				relativeTo: "canvas",
				x: 10,
				y: 10,
			};
			const items = itemsFile(
				JSON.stringify([firstPage, page([canvasItem], false, null)]),
			);

			expect(() =>
				runExtract({ items, topLeft: topLeftId, bottomRight: bottomRightId }),
			).toThrow(/parent_top_left/);
		});
	});

	describe("when the anchor flags are missing", () => {
		it("should fail naming both flags", () => {
			expect(() => runExtract({ items: "board-items.json" })).toThrow(
				/--top-left .*--bottom-right/,
			);
		});
	});

	describe("when the items file is missing", () => {
		it("should fail naming the flag", () => {
			expect(() =>
				runExtract({ topLeft: topLeftId, bottomRight: bottomRightId }),
			).toThrow(/--items <file> is required/);
		});
	});
});
