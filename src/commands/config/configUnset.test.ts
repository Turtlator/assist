import { beforeEach, describe, expect, it, vi } from "vitest";
import { configUnset } from "./configUnset";

const mockLoadProjectConfig = vi.fn<() => Record<string, unknown>>();
const mockLoadGlobalConfigRaw = vi.fn<() => Record<string, unknown>>();
const mockSaveConfig = vi.fn();
const mockSaveGlobalConfig = vi.fn();

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => ({}),
	loadProjectConfig: () => mockLoadProjectConfig(),
	loadGlobalConfigRaw: () => mockLoadGlobalConfigRaw(),
	saveConfig: (c: unknown) => mockSaveConfig(c),
	saveGlobalConfig: (c: unknown) => mockSaveGlobalConfig(c),
}));

describe("configUnset", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadProjectConfig.mockReturnValue({});
		mockLoadGlobalConfigRaw.mockReturnValue({});
	});

	describe("without --global", () => {
		it("should remove the key from the project config", () => {
			mockLoadProjectConfig.mockReturnValue({
				commit: { push: true, pull: true },
			});

			configUnset("commit.push");

			expect(mockSaveConfig).toHaveBeenCalledWith({ commit: { pull: true } });
			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
		});

		it("should prune the parent left empty", () => {
			mockLoadProjectConfig.mockReturnValue({ worktree: { enabled: true } });

			configUnset("worktree.enabled");

			expect(mockSaveConfig).toHaveBeenCalledWith({});
		});

		it("should preserve unrelated keys", () => {
			mockLoadProjectConfig.mockReturnValue({
				worktree: { enabled: true },
				commit: { push: true },
			});

			configUnset("worktree.enabled");

			expect(mockSaveConfig).toHaveBeenCalledWith({ commit: { push: true } });
		});
	});

	describe("with --global", () => {
		it("should remove the key from the global config", () => {
			mockLoadGlobalConfigRaw.mockReturnValue({
				sync: { autoConfirm: true },
				commit: { push: true },
			});

			configUnset("sync.autoConfirm", { global: true });

			expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
				commit: { push: true },
			});
			expect(mockSaveConfig).not.toHaveBeenCalled();
		});
	});

	describe("global-only keys", () => {
		it("should reject sync.autoConfirm without --global", () => {
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configUnset("sync.autoConfirm");

			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockSaveConfig).not.toHaveBeenCalled();
			mockExit.mockRestore();
		});
	});

	describe("when the result fails validation", () => {
		it("should exit non-zero without writing", () => {
			mockLoadProjectConfig.mockReturnValue({
				roam: { clientId: "id", clientSecret: "secret" },
			});
			const mockExit = vi
				.spyOn(process, "exit")
				.mockImplementation(() => undefined as never);

			configUnset("roam.clientId");

			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockSaveConfig).not.toHaveBeenCalled();
			mockExit.mockRestore();
		});
	});

	describe("when the key is absent", () => {
		it("should not write the config", () => {
			mockLoadProjectConfig.mockReturnValue({ commit: { push: true } });

			configUnset("worktree.enabled");

			expect(mockSaveConfig).not.toHaveBeenCalled();
			expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
		});

		it("should report which layer was checked", () => {
			const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

			configUnset("worktree.enabled");

			expect(log.mock.calls[0][0]).toContain("not set in the project config");
			log.mockRestore();
		});
	});
});
