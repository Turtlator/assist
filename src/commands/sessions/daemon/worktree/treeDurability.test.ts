import { describe, expect, it } from "vitest";
import { treeDurability } from "./treeDurability";

describe("treeDurability", () => {
	it("is undurable while the tree is dirty", () => {
		expect(treeDurability({ dirty: true, localOnlyCommits: false })).toEqual({
			durable: false,
			reason: "uncommitted changes",
		});
	});

	it("holds commits that are not on any remote", () => {
		expect(treeDurability({ dirty: false, localOnlyCommits: true })).toEqual({
			durable: false,
			reason: "unpushed commits",
		});
	});

	it("is durable on a clean tree with no local-only commits", () => {
		expect(treeDurability({ dirty: false, localOnlyCommits: false })).toEqual({
			durable: true,
		});
	});
});
