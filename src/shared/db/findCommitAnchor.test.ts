import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { findCommitAnchor } from "./findCommitAnchor";
import { itemGitRefs, items } from "./schema";

const at = (minutes: number) => new Date(Date.UTC(2026, 0, 1, 0, minutes));

describe("findCommitAnchor", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
		await orm.insert(items).values({ id: 1, origin: "test", name: "Item" });
	});

	afterEach(async () => {
		await close();
	});

	it("returns the oldest commit and the oldest recorded parent", async () => {
		await orm.insert(itemGitRefs).values([
			{ itemId: 1, kind: "commit", ref: "second", createdAt: at(2) },
			{ itemId: 1, kind: "commit-parent", ref: "first", createdAt: at(2) },
			{ itemId: 1, kind: "commit", ref: "first", createdAt: at(1) },
			{ itemId: 1, kind: "commit-parent", ref: "base", createdAt: at(1) },
		]);

		expect(await findCommitAnchor(orm, 1)).toEqual({
			commit: "first",
			parent: "base",
		});
	});

	it("returns only the commit when no parent was recorded", async () => {
		await orm
			.insert(itemGitRefs)
			.values([{ itemId: 1, kind: "commit", ref: "first", createdAt: at(1) }]);

		expect(await findCommitAnchor(orm, 1)).toEqual({ commit: "first" });
	});

	it("ignores branch, pr and slack refs", async () => {
		await orm.insert(itemGitRefs).values([
			{ itemId: 1, kind: "branch", ref: "feature", createdAt: at(1) },
			{ itemId: 1, kind: "pr", ref: "42", createdAt: at(2) },
			{ itemId: 1, kind: "slack", ref: "thread", createdAt: at(3) },
		]);

		expect(await findCommitAnchor(orm, 1)).toEqual({});
	});

	it("returns nothing for an item with no refs", async () => {
		expect(await findCommitAnchor(orm, 1)).toEqual({});
	});

	it("does not read another item's refs", async () => {
		await orm.insert(items).values({ id: 2, origin: "test", name: "Other" });
		await orm
			.insert(itemGitRefs)
			.values([{ itemId: 2, kind: "commit", ref: "theirs", createdAt: at(1) }]);

		expect(await findCommitAnchor(orm, 1)).toEqual({});
	});
});
