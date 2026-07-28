import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfigFrom } from "./loadConfigFrom";

let base: string;
let repo: string;

beforeEach(() => {
	base = mkdtempSync(join(tmpdir(), "assist-config-secrets-"));
	repo = join(base, "repo");
	mkdirSync(repo, { recursive: true });
	mkdirSync(join(base, "home"), { recursive: true });
	writeFileSync(join(base, "home", ".assist.yml"), "");
	vi.stubEnv("HOME", join(base, "home"));
});

afterEach(() => {
	vi.unstubAllEnvs();
	rmSync(base, { recursive: true, force: true });
});

describe("loadConfigFrom with secret values", () => {
	it("returns the real values the consuming commands read", () => {
		writeFileSync(
			join(repo, "assist.yml"),
			[
				"database:",
				"  url: postgres://user:pass@host/db",
				"sql:",
				"  connections:",
				"    - name: main",
				"      server: localhost",
				"      port: 1433",
				"      user: sa",
				"      password: hunter2",
				"      database: app",
				"seq:",
				"  connections:",
				"    - name: prod",
				"      url: https://seq",
				"      apiToken: t0ken",
				"roam:",
				"  clientId: cid",
				"  clientSecret: csecret",
				"",
			].join("\n"),
		);

		const config = loadConfigFrom(repo);

		expect(config.database?.url).toBe("postgres://user:pass@host/db");
		expect(config.sql?.connections[0]?.password).toBe("hunter2");
		expect(config.seq?.connections[0]?.apiToken).toBe("t0ken");
		expect(config.roam?.clientSecret).toBe("csecret");
	});
});
