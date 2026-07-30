import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";

const mockResolveRunConfig = vi.fn();

vi.mock("./resolveRunConfig", () => ({
	resolveRunConfig: (name: string, cwd: string) =>
		mockResolveRunConfig(name, cwd),
}));

vi.mock("../../../shared/runConfigBaseDir", () => ({
	runConfigBaseDirFrom: (cwd: string) => cwd,
}));

vi.mock("node:fs", () => ({
	existsSync: (path: string) => path === "/repo",
}));

import { exitDetail, exitReason } from "./exitReason";

function session(overrides: Partial<Session>): Session {
	return { id: "1", name: "run: start", ...overrides } as Session;
}

beforeEach(() => {
	vi.clearAllMocks();
	mockResolveRunConfig.mockReturnValue(undefined);
});

describe("exitDetail", () => {
	it("reports a session cwd that no longer exists", () => {
		expect(exitDetail(session({ cwd: "/gone" }))).toBe(
			"working directory /gone no longer exists",
		);
	});

	it("reports a run config whose resolved cwd does not exist", () => {
		mockResolveRunConfig.mockReturnValue({
			name: "start",
			command: "npm",
			cwd: "../graphql",
		});

		const detail = exitDetail(
			session({ commandType: "run", runName: "start", cwd: "/repo" }),
		);

		expect(mockResolveRunConfig).toHaveBeenCalledWith("start", "/repo");
		expect(detail).toBe('run config "start": cwd /graphql does not exist');
	});

	it("has no detail when the run config cwd exists", () => {
		mockResolveRunConfig.mockReturnValue({ name: "start", command: "npm" });

		expect(
			exitDetail(
				session({ commandType: "run", runName: "start", cwd: "/repo" }),
			),
		).toBeUndefined();
	});

	it("ignores run config lookup for a claude session", () => {
		expect(
			exitDetail(session({ commandType: "claude", cwd: "/repo" })),
		).toBeUndefined();
		expect(mockResolveRunConfig).not.toHaveBeenCalled();
	});
});

describe("exitReason", () => {
	it("appends the detail to the exit code", () => {
		expect(
			exitReason(1, 'run config "start": cwd /graphql does not exist'),
		).toBe(
			'process exited with code 1: run config "start": cwd /graphql does not exist',
		);
	});

	it("is the bare exit code with no detail", () => {
		expect(exitReason(2, undefined)).toBe("process exited with code 2");
	});
});
