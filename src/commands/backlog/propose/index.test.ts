import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { asc, eq } from "drizzle-orm";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import { createTestDb } from "../../../shared/db/createTestDb";
import type { Db } from "../../../shared/db/Db";
import { items, itemSubtasks, planPhases } from "../../../shared/db/schema";
import type { AssistConfig } from "../../../shared/types";
import { propose } from "./index";

let orm: Db;
let close: () => Promise<void>;
let mockConfig: AssistConfig;

const mockRequestPreviewDecision = vi.fn();

vi.mock("../../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

vi.mock("../shared", () => ({
	getOrigin: () => "test",
}));

vi.mock("../ensureRemoteOrigin", () => ({
	ensureRemoteOrigin: () => true,
}));

vi.mock("../../../shared/loadConfig", () => ({
	loadConfig: () => mockConfig,
}));

vi.mock("../../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));

const bug = {
	name: "Preview never opens",
	type: "bug",
	description: "**Repro:**\n\n1. File a bug",
	acceptanceCriteria: ["The pane opens", "Approval creates the item"],
};

function writePayload(content: unknown): string {
	const dir = mkdtempSync(join(tmpdir(), "assist-propose-"));
	const file = join(dir, "item.json");
	writeFileSync(file, JSON.stringify(content));
	return file;
}

function allItems() {
	return orm
		.select({ id: items.id, name: items.name, type: items.type })
		.from(items);
}

let logSpy: MockInstance<typeof console.log>;

beforeEach(async () => {
	({ orm, close } = await createTestDb());
	mockConfig = {} as AssistConfig;
	mockRequestPreviewDecision.mockReset();
	logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

afterEach(async () => {
	await close();
	vi.restoreAllMocks();
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

describe("propose outside a web session", () => {
	it("prints the rendered item and creates it", async () => {
		await propose({ json: writePayload(bug) });

		const output = logSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("Preview never opens");
		expect(output).toContain("The pane opens");
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();

		const created = await allItems();
		expect(created).toHaveLength(1);
		expect(created[0]).toMatchObject({
			name: "Preview never opens",
			type: "bug",
		});
	});
});

describe("propose inside a web session", () => {
	beforeEach(() => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "7";
	});

	it("previews the item as a backlog-item kind before creating it", async () => {
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await propose({ json: writePayload(bug) });

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "7",
				title: "Preview never opens",
				kind: "backlog-item",
				itemType: "bug",
				prNumber: null,
			}),
		);
		const body = mockRequestPreviewDecision.mock.calls[0][0].body as string;
		expect(body).toContain("**Type:** bug");
		expect(body).toContain("1. File a bug");
		expect(body).toContain("1. The pane opens");
	});

	it("writes the item, the bug's Fix phase and configured sub-tasks on approval", async () => {
		mockConfig = { subtasks: [{ title: "Write tests" }] } as AssistConfig;
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await propose({ json: writePayload(bug) });

		const [item] = await allItems();
		expect(item.name).toBe("Preview never opens");
		expect(
			await orm
				.select({ idx: planPhases.idx, name: planPhases.name })
				.from(planPhases)
				.where(eq(planPhases.itemId, item.id))
				.orderBy(asc(planPhases.idx)),
		).toEqual([{ idx: 0, name: "Fix" }]);
		expect(
			await orm
				.select({ title: itemSubtasks.title })
				.from(itemSubtasks)
				.where(eq(itemSubtasks.itemId, item.id)),
		).toEqual([{ title: "Write tests" }]);
	});

	it("exits non-zero without creating the item when the preview is rejected", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process.exit");
		}) as never);
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "needs repro steps",
			comments: [{ quote: "File a bug", note: "which bug?" }],
		});

		await expect(propose({ json: writePayload(bug) })).rejects.toThrow(
			"process.exit",
		);

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("needs repro steps");
		expect(output).toContain("> File a bug");
		expect(output).toContain("which bug?");
		expect(await allItems()).toEqual([]);
	});
});
