import { beforeEach, describe, expect, it, vi } from "vitest";
import { execGit } from "./execGit";
import { revertPathChanges } from "./revertPathChanges";

vi.mock("./execGit", () => ({ execGit: vi.fn() }));

const execGitMock = vi.mocked(execGit);

function withGit(responder: (args: string[]) => string): void {
	execGitMock.mockImplementation(async (_cwd, args) => responder(args));
}

const gitCalls = (): string[][] =>
	execGitMock.mock.calls.map(([, args]) => args);

describe("revertPathChanges", () => {
	beforeEach(() => vi.clearAllMocks());

	it("restores a tracked file from HEAD", async () => {
		withGit((args) =>
			args[0] === "ls-tree" ? "100644 blob abc\tsrc/app.ts\n" : "",
		);

		await revertPathChanges("/repo", "src/app.ts");

		expect(gitCalls()).toContainEqual(["checkout", "HEAD", "--", "src/app.ts"]);
	});

	it("deletes an untracked file", async () => {
		withGit((args) => {
			if (args[0] === "ls-files") throw new Error("not tracked");
			return "";
		});

		await revertPathChanges("/repo", "src/new.ts");

		expect(gitCalls()).toContainEqual(["clean", "-f", "--", "src/new.ts"]);
		expect(gitCalls()).not.toContainEqual([
			"checkout",
			"HEAD",
			"--",
			"src/new.ts",
		]);
	});

	it("removes a staged addition that is not in HEAD", async () => {
		withGit(() => "");

		await revertPathChanges("/repo", "src/staged.ts");

		expect(gitCalls()).toContainEqual(["rm", "-f", "--", "src/staged.ts"]);
	});
});
