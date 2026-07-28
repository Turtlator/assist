import { describe, expect, it } from "vitest";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { filterConfigEntries } from "./filterConfigEntries";

function entry(key: string): ConfigEntry {
	return { key, type: "string", value: undefined, source: "default" };
}

const entries = [
	entry("commit.pull"),
	entry("backup.dir"),
	entry("sessions.daemonPort"),
];

describe("filterConfigEntries", () => {
	it("matches case-insensitively", () => {
		expect(filterConfigEntries(entries, "COMMIT").map((e) => e.key)).toEqual([
			"commit.pull",
		]);
	});

	it("matches a substring in the middle of the dotted key", () => {
		expect(filterConfigEntries(entries, "daemon").map((e) => e.key)).toEqual([
			"sessions.daemonPort",
		]);
	});

	it("returns every entry for an empty or whitespace search", () => {
		expect(filterConfigEntries(entries, "")).toEqual(entries);
		expect(filterConfigEntries(entries, "   ")).toEqual(entries);
	});

	it("returns nothing when no key matches", () => {
		expect(filterConfigEntries(entries, "nosuchkey")).toEqual([]);
	});
});
