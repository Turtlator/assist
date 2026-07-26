import { describe, expect, it } from "vitest";
import { configPathMatches } from "./configPathMatches";
import type { ConfigPath } from "./formatConfigPath";
import { parseConfigPath } from "./parseConfigPath";

function path(text: string): ConfigPath {
	const parsed = parseConfigPath(text);
	if (!parsed) throw new Error(`Unparseable path ${text}`);
	return parsed;
}

describe("configPathMatches", () => {
	it("matches a concrete path against an item wildcard", () => {
		const pattern = path("sql.connections[].password");

		expect(
			configPathMatches(pattern, path("sql.connections[0].password")),
		).toBe(true);
		expect(
			configPathMatches(pattern, path("sql.connections[7].password")),
		).toBe(true);
		expect(configPathMatches(pattern, path("sql.connections[0].user"))).toBe(
			false,
		);
		expect(
			configPathMatches(pattern, path("seq.connections[0].password")),
		).toBe(false);
	});

	it("matches a record key against an entry wildcard", () => {
		expect(
			configPathMatches(path("run[].env.*"), path("run[1].env.TOKEN")),
		).toBe(true);
		expect(
			configPathMatches(path("cliReadVerbs.*"), path("cliReadVerbs.git")),
		).toBe(true);
	});

	it("requires the same length and rejects a wildcard in the value path", () => {
		expect(configPathMatches(path("deny[]"), path("deny[0].pattern"))).toBe(
			false,
		);
		expect(configPathMatches(path("deny[0]"), path("deny[]"))).toBe(false);
	});
});
