import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { signPreflightProblem } from "./signPreflightProblem";

describe("signPreflightProblem", () => {
	let dir: string;
	let source: string;

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "sign-preflight-"));
		source = join(dir, "source");
		mkdirSync(source);
		process.env.WEB_EXT_API_KEY = "user:1:1";
		process.env.WEB_EXT_API_SECRET = "secret";
	});

	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
		delete process.env.WEB_EXT_API_KEY;
		delete process.env.WEB_EXT_API_SECRET;
	});

	function bundle(): void {
		writeFileSync(join(source, "content.js"), "console.log(1)");
	}

	it("reports an unbuilt extension", () => {
		expect(signPreflightProblem(source)?.message).toContain("no content.js");
	});

	it("reports a missing api key", () => {
		bundle();
		delete process.env.WEB_EXT_API_KEY;
		expect(signPreflightProblem(source)?.message).toContain("WEB_EXT_API_KEY");
	});

	it("reports a missing api secret", () => {
		bundle();
		delete process.env.WEB_EXT_API_SECRET;
		expect(signPreflightProblem(source)?.message).toContain("WEB_EXT_API_KEY");
	});

	it("passes a built extension with credentials", () => {
		bundle();
		expect(signPreflightProblem(source)).toBeNull();
	});
});
