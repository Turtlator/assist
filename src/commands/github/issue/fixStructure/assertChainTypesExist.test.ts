import { describe, expect, it } from "vitest";
import { assertChainTypesExist } from "./assertChainTypesExist";

const issueTypes = [
	{ id: "IT_epic", name: "Epic" },
	{ id: "IT_story", name: "Story" },
	{ id: "IT_sub", name: "Sub-task" },
];

describe("assertChainTypesExist", () => {
	it("accepts a chain whose levels match loosely", () => {
		expect(() =>
			assertChainTypesExist(["Epic", "Story", "Subtask"], issueTypes),
		).not.toThrow();
	});

	it("names every missing level and lists the types the org has", () => {
		expect(() =>
			assertChainTypesExist(["Initiative", "Epic", "Widget"], issueTypes),
		).toThrow(
			"The organisation has no Initiative, Widget issue types. It has Epic, Story, Sub-task",
		);
	});
});
