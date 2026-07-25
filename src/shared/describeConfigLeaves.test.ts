import { describe, expect, it } from "vitest";
import { z } from "zod";
import { type ConfigLeaf, describeConfigLeaves } from "./describeConfigLeaves";
import { assistConfigSchema } from "./types";

function leaf(leaves: ConfigLeaf[], key: string): ConfigLeaf {
	const found = leaves.find((entry) => entry.key === key);
	if (!found) throw new Error(`No leaf for ${key}`);
	return found;
}

describe("describeConfigLeaves", () => {
	it("enumerates nested leaves with dotted paths", () => {
		const schema = z.strictObject({
			branch: z
				.strictObject({
					prefix: z.string().optional(),
					defaultBranch: z.string().optional(),
				})
				.optional(),
			nested: z
				.strictObject({
					inner: z.strictObject({ value: z.number() }).default({ value: 1 }),
				})
				.default({ inner: { value: 1 } }),
		});

		expect(describeConfigLeaves(schema).map((entry) => entry.key)).toEqual([
			"branch.defaultBranch",
			"branch.prefix",
			"nested.inner.value",
		]);
	});

	it("detects the type behind each leaf", () => {
		const schema = z.strictObject({
			text: z.string(),
			count: z.number().optional(),
			flag: z.boolean().default(false),
			mode: z.enum(["block", "warn"]).default("block"),
			list: z.array(z.string()),
			map: z.record(z.string(), z.string()),
			either: z.union([z.boolean(), z.string()]),
		});
		const leaves = describeConfigLeaves(schema);

		expect(leaves.map((entry) => [entry.key, entry.type])).toEqual([
			["count", "number"],
			["either", "other"],
			["flag", "boolean"],
			["list", "array"],
			["map", "record"],
			["mode", "enum"],
			["text", "string"],
		]);
	});

	it("reports enum members and schema defaults", () => {
		const schema = z.strictObject({
			mode: z.enum(["block", "warn", "off"]).default("warn"),
			dir: z.string().default("~/out"),
			ignore: z.array(z.string()).default(["a"]),
			plain: z.string().optional(),
		});
		const leaves = describeConfigLeaves(schema);

		expect(leaf(leaves, "mode").enumValues).toEqual(["block", "warn", "off"]);
		expect(leaf(leaves, "mode").defaultValue).toBe("warn");
		expect(leaf(leaves, "dir").defaultValue).toBe("~/out");
		expect(leaf(leaves, "ignore").defaultValue).toEqual(["a"]);
		expect(leaf(leaves, "plain").defaultValue).toBeUndefined();
		expect(leaf(leaves, "plain").enumValues).toBeUndefined();
	});

	it("treats arrays and records as leaves rather than descending", () => {
		const schema = z.strictObject({
			list: z.array(z.strictObject({ name: z.string() })),
			map: z.record(z.string(), z.record(z.string(), z.unknown())),
		});

		expect(describeConfigLeaves(schema).map((entry) => entry.key)).toEqual([
			"list",
			"map",
		]);
	});

	it("describes the real assistConfigSchema", () => {
		const leaves = describeConfigLeaves(assistConfigSchema);

		expect(leaf(leaves, "voice.models.vad").type).toBe("string");
		expect(leaf(leaves, "sql.connections").type).toBe("array");
		expect(leaf(leaves, "cliReadVerbs").type).toBe("record");
		expect(leaf(leaves, "commit.conventional").type).toBe("boolean");
		expect(leaf(leaves, "sessions.windowsDaemonPort").type).toBe("number");
		expect(leaf(leaves, "harness.engine")).toMatchObject({
			type: "enum",
			enumValues: ["claude", "codex", "pi"],
			defaultValue: "claude",
		});
		expect(leaf(leaves, "worktree.install").type).toBe("other");
	});
});
