import { describe, expect, it } from "vitest";
import { describeConfigNode } from "./describeConfigNode";
import { findConfigNode } from "./findConfigNode";
import { parseConfigPath } from "./parseConfigPath";
import { REDACTED_SECRET } from "./redactConfigSecrets";
import { restoreConfigSecrets } from "./restoreConfigSecrets";
import { assistConfigSchema } from "./types";

const schemaNode = describeConfigNode(assistConfigSchema);

function nodeAt(key: string) {
	const path = parseConfigPath(key);
	if (!path) throw new Error(`bad path ${key}`);
	return findConfigNode(schemaNode, path);
}

const storedConnections = [
	{
		name: "main",
		server: "localhost",
		port: 1433,
		user: "sa",
		password: "hunter2",
		database: "app",
	},
];

describe("restoreConfigSecrets", () => {
	it("puts the stored value back where the marker came through untouched", () => {
		const restored = restoreConfigSecrets(
			[{ ...storedConnections[0], port: 1434, password: REDACTED_SECRET }],
			storedConnections,
			nodeAt("sql.connections"),
		);

		expect(restored).toEqual([
			{ ...storedConnections[0], port: 1434, password: "hunter2" },
		]);
	});

	it("keeps a replacement value the marker was overwritten with", () => {
		const restored = restoreConfigSecrets(
			[{ ...storedConnections[0], password: "newpass" }],
			storedConnections,
			nodeAt("sql.connections"),
		);

		expect(restored).toEqual([
			{ ...storedConnections[0], password: "newpass" },
		]);
	});

	it("restores a secret scalar addressed directly", () => {
		expect(
			restoreConfigSecrets(
				REDACTED_SECRET,
				"postgres://u:p@host/db",
				nodeAt("database.url"),
			),
		).toBe("postgres://u:p@host/db");
	});

	it("leaves the marker resolving to undefined when nothing is stored", () => {
		expect(
			restoreConfigSecrets(REDACTED_SECRET, undefined, nodeAt("database.url")),
		).toBeUndefined();
	});

	it("pairs list entries with their stored counterpart by position", () => {
		const stored = [
			{ name: "a", url: "https://a", apiToken: "ta" },
			{ name: "b", url: "https://b", apiToken: "tb" },
		];
		const restored = restoreConfigSecrets(
			[
				{ name: "a", url: "https://a", apiToken: REDACTED_SECRET },
				{ name: "b", url: "https://b", apiToken: REDACTED_SECRET },
			],
			stored,
			nodeAt("seq.connections"),
		);

		expect(restored).toEqual(stored);
	});

	it("leaves non-secret leaves alone", () => {
		expect(restoreConfigSecrets(true, false, nodeAt("commit.push"))).toBe(true);
	});
});
