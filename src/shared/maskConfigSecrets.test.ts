import { describe, expect, it } from "vitest";
import { describeConfigLeaves } from "./describeConfigLeaves";
import { describeConfigNode } from "./describeConfigNode";
import { findConfigNode } from "./findConfigNode";
import { maskConfigSecrets, SECRET_MASK } from "./maskConfigSecrets";
import { parseConfigPath } from "./parseConfigPath";
import { assistConfigSchema } from "./types";

const schemaNode = describeConfigNode(assistConfigSchema);

function nodeAt(key: string) {
	const path = parseConfigPath(key);
	if (!path) throw new Error(`bad path ${key}`);
	return findConfigNode(schemaNode, path);
}

function leafFor(key: string) {
	const leaf = describeConfigLeaves(assistConfigSchema).find(
		(candidate) => candidate.key === key,
	);
	if (!leaf) throw new Error(`no leaf for ${key}`);
	return leaf;
}

describe("secret markers", () => {
	it("marks a secret nested inside an array of objects", () => {
		expect(nodeAt("sql.connections[].password")?.secret).toBe(true);
		expect(nodeAt("seq.connections[].apiToken")?.secret).toBe(true);
	});

	it("marks optional and top-level secret scalars", () => {
		expect(nodeAt("database.url")?.secret).toBe(true);
		expect(nodeAt("roam.accessToken")?.secret).toBe(true);
		expect(nodeAt("roam.clientSecret")?.secret).toBe(true);
	});

	it("leaves non-credential fields unmarked", () => {
		expect(nodeAt("ravendb.connections[].apiKeyRef")?.secret).toBeUndefined();
		expect(nodeAt("sql.connections[].user")?.secret).toBeUndefined();
		expect(nodeAt("commit.push")?.secret).toBeUndefined();
	});

	it("surfaces the marker on described leaves", () => {
		expect(leafFor("database.url").secret).toBe(true);
		expect(leafFor("commit.push").secret).toBeUndefined();
	});
});

describe("maskConfigSecrets", () => {
	it("masks a secret inside an array of objects and leaves siblings alone", () => {
		const masked = maskConfigSecrets(
			{
				sql: {
					connections: [
						{ name: "main", user: "sa", password: "hunter2", port: 1433 },
					],
				},
			},
			schemaNode,
		);

		expect(masked).toEqual({
			sql: {
				connections: [
					{ name: "main", user: "sa", password: SECRET_MASK, port: 1433 },
				],
			},
		});
	});

	it("masks a top-level secret scalar", () => {
		expect(
			maskConfigSecrets({ url: "postgres://u:p@host/db" }, nodeAt("database")),
		).toEqual({
			url: SECRET_MASK,
		});
	});

	it("masks the value itself when addressed directly", () => {
		expect(
			maskConfigSecrets("hunter2", nodeAt("sql.connections[].password")),
		).toBe(SECRET_MASK);
	});

	it("masks secrets inside a repos override block", () => {
		const masked = maskConfigSecrets(
			{ repos: { "local:/repo": { database: { url: "postgres://secret" } } } },
			schemaNode,
		) as { repos: Record<string, { database: { url: string } }> };

		expect(masked.repos["local:/repo"]?.database.url).toBe(SECRET_MASK);
	});

	it("leaves an unset secret absent rather than masked", () => {
		expect(maskConfigSecrets({ sql: { connections: [] } }, schemaNode)).toEqual(
			{
				sql: { connections: [] },
			},
		);
	});
});
