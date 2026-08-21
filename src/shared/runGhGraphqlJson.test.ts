import { afterEach, describe, expect, it, vi } from "vitest";

const spawnSync = vi.fn();
vi.mock("node:child_process", () => ({
	spawnSync: (...args: unknown[]) => spawnSync(...args),
}));

import { runGhGraphqlJson } from "./runGhGraphqlJson";

afterEach(() => {
	spawnSync.mockReset();
});

describe("runGhGraphqlJson", () => {
	it("passes the query and list variables as a JSON body on stdin", () => {
		spawnSync.mockReturnValue({ status: 0, stdout: "{}" });
		runGhGraphqlJson("query($ids: [ID!]!) { nodes(ids: $ids) { id } }", {
			ids: ["a", "b"],
		});
		const [command, args, options] = spawnSync.mock.calls[0] as [
			string,
			string[],
			{ input: string },
		];
		expect(command).toBe("gh");
		expect(args).toEqual(["api", "graphql", "--input", "-"]);
		expect(JSON.parse(options.input)).toEqual({
			query: "query($ids: [ID!]!) { nodes(ids: $ids) { id } }",
			variables: { ids: ["a", "b"] },
		});
	});

	it("throws when the subprocess exits non-zero", () => {
		spawnSync.mockReturnValue({ status: 1, stderr: "boom", stdout: "" });
		expect(() => runGhGraphqlJson("query")).toThrow("boom");
	});

	it("throws when the response carries a GraphQL errors array", () => {
		spawnSync.mockReturnValue({
			status: 0,
			stdout: JSON.stringify({
				data: null,
				errors: [{ message: "exceeds the node limit" }],
			}),
		});
		expect(() => runGhGraphqlJson("query")).toThrow("exceeds the node limit");
	});

	it("returns stdout when there are no errors", () => {
		const stdout = JSON.stringify({ data: { nodes: [] } });
		spawnSync.mockReturnValue({ status: 0, stdout });
		expect(runGhGraphqlJson("query")).toBe(stdout);
	});
});
