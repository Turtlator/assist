import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

import { pushCommit } from "./pushCommit";

type GitOutputs = Record<string, string>;

function gitState(outputs: GitOutputs): void {
	mockExecSync.mockImplementation((command: string) => {
		if (command in outputs) return outputs[command];
		if (command.startsWith("git config --get")) throw new Error("exit 1");
		return "";
	});
}

const pushed = () =>
	mockExecSync.mock.calls
		.map(([command]) => command as string)
		.filter((command) => command.startsWith("git push"));

beforeEach(() => {
	vi.clearAllMocks();
});

describe("pushCommit", () => {
	describe("when the upstream branch name matches the local branch", () => {
		it("should push plainly", () => {
			gitState({
				"git symbolic-ref --short HEAD": "feature-x\n",
				"git config --get branch.feature-x.remote": "origin\n",
				"git config --get branch.feature-x.merge": "refs/heads/feature-x\n",
			});

			pushCommit();

			expect(pushed()).toEqual(["git push"]);
		});
	});

	describe("when the upstream branch name differs from the local branch", () => {
		it("should push HEAD at the upstream branch explicitly", () => {
			gitState({
				"git symbolic-ref --short HEAD": "assist-2\n",
				"git config --get branch.assist-2.remote": "origin\n",
				"git config --get branch.assist-2.merge": "refs/heads/main\n",
			});

			pushCommit();

			expect(pushed()).toEqual(["git push origin HEAD:main"]);
		});
	});

	describe("when the branch has no upstream", () => {
		it("should push plainly so git reports its own guidance", () => {
			gitState({ "git symbolic-ref --short HEAD": "feature-x\n" });

			pushCommit();

			expect(pushed()).toEqual(["git push"]);
		});
	});

	describe("when HEAD is detached", () => {
		it("should push plainly", () => {
			mockExecSync.mockImplementation((command: string) => {
				if (command === "git symbolic-ref --short HEAD")
					throw new Error("not a symbolic ref");
				return "";
			});

			pushCommit();

			expect(pushed()).toEqual(["git push"]);
		});
	});
});
