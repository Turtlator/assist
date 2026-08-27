import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const mockRespondJson = vi.fn();

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

import { listScopedRules } from "./listScopedRules";

type Rule = { code: string; text: string; source: string };

const root = mkdtempSync(join(tmpdir(), "assist-scoped-rules-"));
mkdirSync(join(root, ".git"));
mkdirSync(join(root, "refinement"));
writeFileSync(
	join(root, "CLAUDE.md"),
	"# Root\n\n## Rules\n\n- **R1** — Keep it tight\n",
);
writeFileSync(
	join(root, "refinement", "CLAUDE.md"),
	"## Rules\n\n- **R2** — Name the decision\n",
);
writeFileSync(join(root, "refinement", "spec.md"), "text\n");

afterAll(() => {
	rmSync(root, { recursive: true, force: true });
});

function request(query: string): [number, { rules?: Rule[]; error?: string }] {
	listScopedRules(
		{ url: `/api/rules?${query}` } as IncomingMessage,
		{} as ServerResponse,
	);
	const [, status, body] = mockRespondJson.mock.lastCall as [
		ServerResponse,
		number,
		{ rules?: Rule[]; error?: string },
	];
	return [status, body];
}

function cwdParam(): string {
	return `cwd=${encodeURIComponent(root)}`;
}

describe("listScopedRules", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the rules in scope for a file, nearest scope first", () => {
		const [status, body] = request(`${cwdParam()}&path=refinement/spec.md`);

		expect(status).toBe(200);
		expect(body.rules).toEqual([
			{
				code: "R2",
				text: "Name the decision",
				source: join("refinement", "CLAUDE.md"),
			},
			{ code: "R1", text: "Keep it tight", source: "CLAUDE.md" },
		]);
	});

	it("falls back to the repo root when no path is given", () => {
		const [status, body] = request(cwdParam());

		expect(status).toBe(200);
		expect(body.rules).toEqual([
			{ code: "R1", text: "Keep it tight", source: "CLAUDE.md" },
		]);
	});

	it("reads the scope of a path that no longer exists", () => {
		const [, body] = request(`${cwdParam()}&path=refinement/gone.md`);

		expect(body.rules?.map((rule) => rule.code)).toEqual(["R2", "R1"]);
	});

	it("rejects a path outside the cwd", () => {
		const [status, body] = request(`${cwdParam()}&path=../escape.md`);

		expect(status).toBe(400);
		expect(body.error).toBe("Path outside cwd");
	});

	it("requires a cwd", () => {
		const [status] = request("path=README.md");

		expect(status).toBe(400);
	});
});
