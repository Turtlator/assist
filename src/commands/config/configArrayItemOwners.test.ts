import { describe, expect, it } from "vitest";
import { configArrayItemOwners } from "./configArrayItemOwners";
import { mergeRawConfigs } from "../../shared/mergeDenyRules";
import type { ConfigEntryLayers } from "./configEntryLayers";

function mergedValue(key: string, layers: ConfigEntryLayers): unknown[] {
	const withRepo = mergeRawConfigs(
		{ [key]: layers.global },
		layers.repo === undefined ? {} : { [key]: layers.repo },
	);
	const merged = mergeRawConfigs(
		withRepo,
		layers.project === undefined ? {} : { [key]: layers.project },
	);
	return (merged[key] ?? []) as unknown[];
}

function ownedValues(key: string, layers: ConfigEntryLayers): unknown[] {
	return configArrayItemOwners(key, layers).map(({ scope, indexInScope }) => {
		const items = layers[scope] as unknown[];
		return items[indexInScope];
	});
}

function expectMatchesMerge(key: string, layers: ConfigEntryLayers) {
	expect(ownedValues(key, layers)).toEqual(mergedValue(key, layers));
}

describe("configArrayItemOwners", () => {
	it("returns nothing when no layer sets the key", () => {
		expect(configArrayItemOwners("run", {})).toEqual([]);
	});

	it("attributes run commands to the layer that defines each name", () => {
		const layers = {
			global: [{ name: "build" }, { name: "test" }],
			project: [{ name: "test" }, { name: "lint" }],
		};

		expect(configArrayItemOwners("run", layers)).toEqual([
			{ scope: "global", indexInScope: 0 },
			{ scope: "project", indexInScope: 0 },
			{ scope: "project", indexInScope: 1 },
		]);
		expectMatchesMerge("run", layers);
	});

	it("lets a project run command shadow both repo and global copies", () => {
		const layers = {
			global: [{ name: "build" }, { name: "test" }],
			repo: [{ name: "test" }, { name: "deploy" }],
			project: [{ name: "test" }],
		};

		expect(configArrayItemOwners("run", layers)).toEqual([
			{ scope: "global", indexInScope: 0 },
			{ scope: "repo", indexInScope: 1 },
			{ scope: "project", indexInScope: 0 },
		]);
		expectMatchesMerge("run", layers);
	});

	it("lets a repo run command shadow the global copy", () => {
		const layers = {
			global: [{ name: "build" }, { name: "test" }],
			repo: [{ name: "build" }],
		};

		expect(configArrayItemOwners("run", layers)).toEqual([
			{ scope: "global", indexInScope: 1 },
			{ scope: "repo", indexInScope: 0 },
		]);
		expectMatchesMerge("run", layers);
	});

	it("keeps run entries without a name from every layer", () => {
		const layers = {
			global: [{ link: "shared.yml" }],
			project: [{ link: "local.yml" }],
		};

		expect(configArrayItemOwners("run", layers)).toEqual([
			{ scope: "global", indexInScope: 0 },
			{ scope: "project", indexInScope: 0 },
		]);
		expectMatchesMerge("run", layers);
	});

	it("attributes deny rules to the layer that defines each pattern", () => {
		const layers = {
			global: [
				{ pattern: "rm -rf", message: "no" },
				{ pattern: "curl", message: "global" },
			],
			project: [{ pattern: "curl", message: "project" }],
		};

		expect(configArrayItemOwners("deny", layers)).toEqual([
			{ scope: "global", indexInScope: 0 },
			{ scope: "project", indexInScope: 0 },
		]);
		expectMatchesMerge("deny", layers);
	});

	it("keeps every subtask, concatenated global then repo then project", () => {
		const layers = {
			global: [{ title: "g1" }],
			repo: [{ title: "r1" }, { title: "r2" }],
			project: [{ title: "p1" }],
		};

		expect(configArrayItemOwners("subtasks", layers)).toEqual([
			{ scope: "global", indexInScope: 0 },
			{ scope: "repo", indexInScope: 0 },
			{ scope: "repo", indexInScope: 1 },
			{ scope: "project", indexInScope: 0 },
		]);
		expectMatchesMerge("subtasks", layers);
	});

	it("keeps duplicate subtask titles from the same layer distinct", () => {
		expect(
			configArrayItemOwners("subtasks", {
				project: [{ title: "same" }, { title: "same" }],
			}),
		).toEqual([
			{ scope: "project", indexInScope: 0 },
			{ scope: "project", indexInScope: 1 },
		]);
	});

	it("gives a plain array key to the highest layer that sets it", () => {
		const layers = {
			global: [{ name: "main" }],
			repo: [{ name: "other" }, { name: "spare" }],
		};

		expect(configArrayItemOwners("sql.connections", layers)).toEqual([
			{ scope: "repo", indexInScope: 0 },
			{ scope: "repo", indexInScope: 1 },
		]);
	});

	it("ignores layers whose value is not an array", () => {
		expect(
			configArrayItemOwners("run", {
				repo: "not-an-array",
				global: [{ name: "build" }],
			}),
		).toEqual([{ scope: "global", indexInScope: 0 }]);
	});
});
