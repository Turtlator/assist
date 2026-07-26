import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";

type FakeChild = EventEmitter & { pid: number; stderr: EventEmitter };

let child: FakeChild;

const mockSpawn = vi.fn((..._args: unknown[]): FakeChild => child);

vi.mock("node:child_process", () => ({
	spawn: (...args: unknown[]) => mockSpawn(...args),
}));

vi.mock("../daemonLog", () => ({ daemonLog: () => {} }));

vi.mock("./resolveInstallCommand", () => ({
	resolveInstallCommand: () => "npm install",
}));

import { runInstall } from "./runInstall";
import { stopInstall } from "./stopInstall";

function seed(worktreePath: string, onSeeded = () => {}): void {
	runInstall(worktreePath, "/home/me/git/assist", true, onSeeded);
}

function invocation(): {
	shell: string;
	args: string[];
	cwd: string;
	detached: boolean | undefined;
} {
	const [shell, args, options] = mockSpawn.mock.calls[0] as unknown as [
		string,
		string[],
		{ cwd: string; detached?: boolean },
	];
	return { shell, args, cwd: options.cwd, detached: options.detached };
}

describe("runInstall", () => {
	beforeEach(() => {
		mockSpawn.mockClear();
		child = Object.assign(new EventEmitter(), {
			pid: 4321,
			stderr: new EventEmitter(),
		});
	});

	it("cds into the worktree so a login shell profile cannot redirect the install", () => {
		seed("/home/me/git/assist-2");

		const { args, cwd } = invocation();
		expect(cwd).toBe("/home/me/git/assist-2");
		expect(args).toEqual([
			"-l",
			"-c",
			"cd '/home/me/git/assist-2' && npm install",
		]);
	});

	it("cds into the worktree on Windows paths", () => {
		seed(String.raw`C:\git\assist-2`);

		const { shell, args } = invocation();
		expect(shell).toBe("cmd.exe");
		expect(args).toEqual([
			"/c",
			String.raw`cd /d "C:\git\assist-2" && npm install`,
		]);
	});

	it("releases the held session once, however many times the install reports closing", () => {
		const onSeeded = vi.fn();

		seed("/home/me/git/assist-2", onSeeded);
		child.emit("close", 0, null);
		child.emit("close", 0, null);

		expect(onSeeded).toHaveBeenCalledTimes(1);
	});

	it("releases the held session when the install cannot start at all", () => {
		const onSeeded = vi.fn();

		seed("/home/me/git/assist-2", onSeeded);
		child.emit("error", new Error("spawn bash ENOENT"));

		expect(onSeeded).toHaveBeenCalledTimes(1);
	});

	it.runIf(process.platform !== "win32")(
		"tracks the install in its own process group so teardown can kill it",
		() => {
			const killed: [number, NodeJS.Signals][] = [];
			const kill = vi.spyOn(process, "kill").mockImplementation(((
				pid: number,
				signal: NodeJS.Signals,
			) => {
				killed.push([pid, signal]);
				return true;
			}) as typeof process.kill);

			seed("/home/me/git/assist-2");
			stopInstall("/home/me/git/assist-2");

			expect(invocation().detached).toBe(true);
			expect(killed).toEqual([[-4321, "SIGKILL"]]);
			kill.mockRestore();
		},
	);

	it("has nothing to kill once the install has finished", () => {
		const kill = vi.spyOn(process, "kill");

		seed("/home/me/git/assist-2");
		child.emit("close", 0, null);
		stopInstall("/home/me/git/assist-2");

		expect(kill).not.toHaveBeenCalled();
		kill.mockRestore();
	});
});
