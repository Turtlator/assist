import { describe, expect, it } from "vitest";
import { treeDurability } from "./treeDurability";

describe("treeDurability", () => {
	it("is undurable while the tree is dirty, regardless of push", () => {
		expect(
			treeDurability({ dirty: true, push: true, localOnlyCommits: false }),
		).toEqual({ durable: false, reason: "uncommitted changes" });
	});

	it("holds local-only commits when commits are not pushed on commit", () => {
		expect(
			treeDurability({ dirty: false, push: false, localOnlyCommits: true }),
		).toEqual({ durable: false, reason: "unpushed commits" });
	});

	it("is durable on a clean tree when push-on-commit is enabled", () => {
		expect(
			treeDurability({ dirty: false, push: true, localOnlyCommits: true }),
		).toEqual({ durable: true });
	});

	it("is durable on a clean tree with no local-only commits", () => {
		expect(
			treeDurability({ dirty: false, push: false, localOnlyCommits: false }),
		).toEqual({ durable: true });
	});
});
