// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postDiffRevert } from "./postDiffRevert";
import { useDiffRevert } from "./useDiffRevert";

vi.mock("./postDiffRevert", () => ({ postDiffRevert: vi.fn() }));

const postDiffRevertMock = vi.mocked(postDiffRevert);

describe("useDiffRevert", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		postDiffRevertMock.mockResolvedValue();
	});

	it("offers no revert handler while it is disabled", () => {
		const { result } = renderHook(() => useDiffRevert("/repo", false, vi.fn()));

		expect(result.current.onRevert).toBeUndefined();
	});

	it("reverts the path and refreshes the diff", async () => {
		const refresh = vi.fn();
		const { result } = renderHook(() => useDiffRevert("/repo", true, refresh));

		act(() => result.current.onRevert?.("src/app.ts"));

		expect(postDiffRevertMock).toHaveBeenCalledWith("/repo", "src/app.ts");
		await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
		expect(result.current.error).toBeNull();
	});

	it("surfaces a failure and clears it on demand", async () => {
		const refresh = vi.fn();
		postDiffRevertMock.mockRejectedValue(new Error("pathspec did not match"));
		const { result } = renderHook(() => useDiffRevert("/repo", true, refresh));

		act(() => result.current.onRevert?.("src/app.ts"));

		await waitFor(() =>
			expect(result.current.error).toBe("pathspec did not match"),
		);
		expect(refresh).not.toHaveBeenCalled();

		act(() => result.current.clearError());

		expect(result.current.error).toBeNull();
	});
});
