import { describe, expect, it } from "vitest";
import { unsetNestedValue } from "./unsetNestedValue";

describe("unsetNestedValue", () => {
	describe("when removing a top-level key", () => {
		it("should delete the key", () => {
			const result = unsetNestedValue({ name: "Alice", age: 1 }, "name");

			expect(result).toEqual({ config: { age: 1 }, removed: true });
		});

		it("should not mutate the original object", () => {
			const original = { name: "Alice" };

			unsetNestedValue(original, "name");

			expect(original).toEqual({ name: "Alice" });
		});
	});

	describe("when removing a nested key", () => {
		it("should preserve sibling keys", () => {
			const result = unsetNestedValue({ a: { x: 1, y: 2 } }, "a.y");

			expect(result).toEqual({ config: { a: { x: 1 } }, removed: true });
		});

		it("should preserve keys outside the path", () => {
			const result = unsetNestedValue({ a: { x: 1 }, b: { y: 2 } }, "a.x");

			expect(result.config).toEqual({ b: { y: 2 } });
		});
	});

	describe("when the parent is left empty", () => {
		it("should prune the empty parent", () => {
			const result = unsetNestedValue(
				{ worktree: { enabled: true } },
				"worktree.enabled",
			);

			expect(result).toEqual({ config: {}, removed: true });
		});

		it("should prune every ancestor left empty", () => {
			const result = unsetNestedValue({ a: { b: { c: 1 } } }, "a.b.c");

			expect(result.config).toEqual({});
		});

		it("should stop pruning at the first non-empty ancestor", () => {
			const result = unsetNestedValue({ a: { b: { c: 1 }, d: 2 } }, "a.b.c");

			expect(result.config).toEqual({ a: { d: 2 } });
		});

		it("should leave the root object empty rather than removing it", () => {
			const result = unsetNestedValue({ name: "Alice" }, "name");

			expect(result.config).toEqual({});
		});
	});

	describe("when the value is an empty container", () => {
		it("should remove an explicitly empty list", () => {
			const result = unsetNestedValue(
				{ worktree: { copy: [] } },
				"worktree.copy",
			);

			expect(result).toEqual({ config: {}, removed: true });
		});

		it("should keep a list left empty by removing its last item", () => {
			const result = unsetNestedValue(
				{ worktree: { copy: [".env"] } },
				"worktree.copy.0",
			);

			expect(result.config).toEqual({ worktree: { copy: [] } });
		});
	});

	describe("when removing an array item", () => {
		it("should splice the item out", () => {
			const result = unsetNestedValue({ items: ["a", "b", "c"] }, "items.1");

			expect(result).toEqual({ config: { items: ["a", "c"] }, removed: true });
		});

		it("should report an out-of-range index as absent", () => {
			const result = unsetNestedValue({ items: ["a"] }, "items.5");

			expect(result).toEqual({ config: { items: ["a"] }, removed: false });
		});

		it("should remove a key nested inside an array item", () => {
			const result = unsetNestedValue(
				{ rules: [{ pattern: "x", message: "y" }] },
				"rules.0.message",
			);

			expect(result.config).toEqual({ rules: [{ pattern: "x" }] });
		});
	});

	describe("when the key is absent", () => {
		it("should report nothing removed for a missing top-level key", () => {
			const result = unsetNestedValue({ a: 1 }, "b");

			expect(result).toEqual({ config: { a: 1 }, removed: false });
		});

		it("should report nothing removed for a missing leaf", () => {
			const result = unsetNestedValue({ a: { x: 1 } }, "a.y");

			expect(result).toEqual({ config: { a: { x: 1 } }, removed: false });
		});

		it("should report nothing removed when an ancestor is missing", () => {
			const result = unsetNestedValue({ a: 1 }, "b.c.d");

			expect(result).toEqual({ config: { a: 1 }, removed: false });
		});

		it("should report nothing removed when the path runs through a scalar", () => {
			const result = unsetNestedValue({ a: 1 }, "a.b");

			expect(result).toEqual({ config: { a: 1 }, removed: false });
		});
	});

	describe("when the stored value is falsy", () => {
		it("should remove a key holding false", () => {
			const result = unsetNestedValue(
				{ commit: { push: false } },
				"commit.push",
			);

			expect(result).toEqual({ config: {}, removed: true });
		});
	});
});
