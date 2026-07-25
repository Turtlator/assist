import { describe, expect, it, vi } from "vitest";

const mockExecFile = vi.fn();

vi.mock("node:child_process", () => ({
	execFile: (...args: unknown[]) => mockExecFile(...args),
}));

vi.mock("../daemonLog", () => ({ daemonLog: () => {} }));

vi.mock("./resolveInstallCommand", () => ({
	resolveInstallCommand: () => "npm install",
}));

vi.mock("./worktreeConfigFor", () => ({
	worktreeConfigFor: () => ({ copy: [], install: true }),
}));

import { seedWorktree } from "./seedWorktree";

function invocation(): { shell: string; args: string[]; cwd: string } {
	const [shell, args, options] = mockExecFile.mock.calls[0] as [
		string,
		string[],
		{ cwd: string },
	];
	return { shell, args, cwd: options.cwd };
}

describe("seedWorktree", () => {
	it("cds into the worktree so a login shell profile cannot redirect the install", () => {
		mockExecFile.mockClear();

		seedWorktree("/home/me/git/assist-2", "/home/me/git/assist");

		const { args, cwd } = invocation();
		expect(cwd).toBe("/home/me/git/assist-2");
		expect(args).toEqual([
			"-l",
			"-c",
			"cd '/home/me/git/assist-2' && npm install",
		]);
	});

	it("cds into the worktree on Windows paths", () => {
		mockExecFile.mockClear();

		seedWorktree(String.raw`C:\git\assist-2`, String.raw`C:\git\assist`);

		const { shell, args } = invocation();
		expect(shell).toBe("cmd.exe");
		expect(args).toEqual([
			"/c",
			String.raw`cd /d "C:\git\assist-2" && npm install`,
		]);
	});
});
