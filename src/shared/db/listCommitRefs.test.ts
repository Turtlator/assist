import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { listCommitRefs } from "./listCommitRefs";
import { itemGitRefs, items } from "./schema";

const at = (minutes: number) => new Date(Date.UTC(2026, 0, 1, 0, minutes));

describe("listCommitRefs", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeAll(async () => {
		({ orm, close } = await createTestDb());
		await orm.insert(items).values({ id: 1, origin: "test", name: "Item" });
	});

	afterEach(async () => {
		await orm.delete(itemGitRefs);
	});

	afterAll(async () => {
		await close();
	});

	it("returns the item's commits oldest first", async () => {
		await orm.insert(itemGitRefs).values([
			{
				itemId: 1,
				kind: "commit",
				ref: "second",
				title: "feat: two",
				url: "https://host/commit/second",
				createdAt: at(2),
			},
			{
				itemId: 1,
				kind: "commit",
				ref: "first",
				title: "feat: one",
				url: "https://host/commit/first",
				createdAt: at(1),
			},
		]);

		expect(await listCommitRefs(orm, 1)).toEqual([
			{ sha: "first", title: "feat: one", url: "https://host/commit/first" },
			{ sha: "second", title: "feat: two", url: "https://host/commit/second" },
		]);
	});

	it("omits a title and url that were never recorded", async () => {
		await orm
			.insert(itemGitRefs)
			.values([{ itemId: 1, kind: "commit", ref: "bare", createdAt: at(1) }]);

		expect(await listCommitRefs(orm, 1)).toEqual([{ sha: "bare" }]);
	});

	it("ignores parent, branch and pr refs", async () => {
		await orm.insert(itemGitRefs).values([
			{ itemId: 1, kind: "commit-parent", ref: "base", createdAt: at(1) },
			{ itemId: 1, kind: "branch", ref: "feature", createdAt: at(2) },
			{ itemId: 1, kind: "pr", ref: "42", createdAt: at(3) },
		]);

		expect(await listCommitRefs(orm, 1)).toEqual([]);
	});

	it("does not read another item's commits", async () => {
		await orm.insert(items).values({ id: 2, origin: "test", name: "Other" });
		await orm
			.insert(itemGitRefs)
			.values([{ itemId: 2, kind: "commit", ref: "theirs", createdAt: at(1) }]);

		expect(await listCommitRefs(orm, 1)).toEqual([]);
	});

	it("returns nothing for an item with no refs", async () => {
		expect(await listCommitRefs(orm, 1)).toEqual([]);
	});
});
