import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { itemCommits } from "./itemCommits";
import { itemScopeCommits } from "./itemScopeCommits";

vi.mock("../../../shared/loadConfigFrom", () => ({ loadConfigFrom: vi.fn() }));
vi.mock("./itemCommits", () => ({ itemCommits: vi.fn(async () => []) }));
vi.mock("./toGitCwd", () => ({ toGitCwd: (cwd: string) => cwd }));

const loadConfigFromMock = vi.mocked(loadConfigFrom);
const itemCommitsMock = vi.mocked(itemCommits);

function config(includeCommittedChanges: boolean): void {
	loadConfigFromMock.mockReturnValue({
		sessions: { includeCommittedChanges },
	} as unknown as ReturnType<typeof loadConfigFrom>);
}

describe("itemScopeCommits", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("lists the item's recorded commits", async () => {
		config(true);
		itemCommitsMock.mockResolvedValue([{ sha: "one", title: "feat: one" }]);

		expect(await itemScopeCommits("/repo", "sess-1")).toEqual([
			{ sha: "one", title: "feat: one" },
		]);
	});

	it("lists nothing when the flag is off", async () => {
		config(false);

		expect(await itemScopeCommits("/repo", "sess-1")).toEqual([]);
		expect(itemCommitsMock).not.toHaveBeenCalled();
	});

	it("lists nothing when the config cannot be loaded", async () => {
		loadConfigFromMock.mockImplementation(() => {
			throw new Error("bad yaml");
		});

		expect(await itemScopeCommits("/repo", "sess-1")).toEqual([]);
		expect(itemCommitsMock).not.toHaveBeenCalled();
	});

	it("lists nothing without a session", async () => {
		config(true);

		expect(await itemScopeCommits("/repo")).toEqual([]);
		expect(itemCommitsMock).not.toHaveBeenCalled();
	});
});
