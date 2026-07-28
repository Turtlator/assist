import { describe, expect, it } from "vitest";
import { describeConfigNode } from "./describeConfigNode";
import { findConfigNode } from "./findConfigNode";
import { parseConfigPath } from "./parseConfigPath";
import {
	isRedactedSecret,
	REDACTED_SECRET,
	redactConfigSecrets,
} from "./redactConfigSecrets";
import { assistConfigSchema } from "./types";

const schemaNode = describeConfigNode(assistConfigSchema);

function nodeAt(key: string) {
	const path = parseConfigPath(key);
	if (!path) throw new Error(`bad path ${key}`);
	return findConfigNode(schemaNode, path);
}

describe("redactConfigSecrets", () => {
	it("replaces a secret inside an array of objects and leaves siblings alone", () => {
		const redacted = redactConfigSecrets(
			[{ name: "main", user: "sa", password: "hunter2", port: 1433 }],
			nodeAt("sql.connections"),
		);

		expect(redacted).toEqual([
			{ name: "main", user: "sa", password: REDACTED_SECRET, port: 1433 },
		]);
	});

	it("replaces a secret scalar addressed directly", () => {
		expect(
			redactConfigSecrets("postgres://u:p@host/db", nodeAt("database.url")),
		).toEqual(REDACTED_SECRET);
	});

	it("leaves an unset secret absent rather than redacted", () => {
		expect(
			redactConfigSecrets(
				[{ name: "main", url: "https://seq" }],
				nodeAt("seq.connections"),
			),
		).toEqual([{ name: "main", url: "https://seq" }]);
	});

	it("carries no trace of the value in its JSON form", () => {
		const json = JSON.stringify(
			redactConfigSecrets(
				{ clientId: "id", clientSecret: "shh", tokenExpiresAt: 1234 },
				nodeAt("roam"),
			),
		);

		expect(json).not.toContain("shh");
		expect(json).toContain("1234");
	});
});

describe("isRedactedSecret", () => {
	it("recognises the marker and nothing else", () => {
		expect(isRedactedSecret(REDACTED_SECRET)).toBe(true);
		expect(isRedactedSecret("hunter2")).toBe(false);
		expect(isRedactedSecret(undefined)).toBe(false);
		expect(isRedactedSecret({ assistSecret: "nope" })).toBe(false);
	});
});
