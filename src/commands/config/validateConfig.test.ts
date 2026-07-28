import { describe, expect, it } from "vitest";
import { z } from "zod";
import { SECRET_MASK } from "../../shared/maskConfigSecrets";
import { secretConfigValue } from "../../shared/secretConfigValue";
import { validateConfig } from "./validateConfig";

const echoingSchema = z.object({
	database: z.object({
		url: secretConfigValue(
			z.string().refine((value) => value.startsWith("postgres://"), {
				error: (issue) => `invalid connection string: ${issue.input}`,
			}),
		),
	}),
});

describe("validateConfig", () => {
	it("accepts a valid config", () => {
		expect(validateConfig({ commit: { push: true } }, "commit.push")).toEqual({
			ok: true,
		});
	});

	it("reports the offending path for an invalid value", () => {
		const result = validateConfig(
			{ sessions: { windowsDaemonPort: "soon" } },
			"sessions.windowsDaemonPort",
		);

		expect(result).toEqual({
			ok: false,
			errors: [
				"sessions.windowsDaemonPort: Invalid input: expected number, received string",
			],
		});
	});

	it("masks a secret value echoed by a validation message", () => {
		const result = validateConfig(
			{ database: { url: "mysql://user:hunter2@host/db" } },
			"database.url",
			echoingSchema,
		);

		expect(result).toEqual({
			ok: false,
			errors: [`database.url: invalid connection string: ${SECRET_MASK}`],
		});
	});

	it("keeps a stored secret out of an unrelated key's validation error", () => {
		const result = validateConfig(
			{
				database: { url: "postgres://user:hunter2@host/db" },
				sessions: { windowsVersionCheck: "sometimes" },
			},
			"sessions.windowsVersionCheck",
		);

		expect(result.ok).toBe(false);
		const errors = result.ok ? [] : result.errors;
		expect(errors.join("\n")).not.toContain("hunter2");
	});
});
