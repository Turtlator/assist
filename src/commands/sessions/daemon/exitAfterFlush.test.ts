import { afterEach, describe, expect, it, vi } from "vitest";
import { exitAfterFlush } from "./exitAfterFlush";

describe("exitAfterFlush", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	it("waits for queued stdout writes to reach the OS before exiting", () => {
		const exit = vi
			.spyOn(process, "exit")
			.mockImplementation((() => undefined) as never);
		let flush: (() => void) | undefined;
		vi.spyOn(process.stdout, "write").mockImplementation(((
			_chunk: string,
			callback: () => void,
		) => {
			flush = callback;
			return true;
		}) as never);

		exitAfterFlush(1);
		expect(exit).not.toHaveBeenCalled();

		flush?.();
		expect(exit).toHaveBeenCalledWith(1);
	});

	it("exits anyway when stdout never drains", () => {
		vi.useFakeTimers();
		const exit = vi
			.spyOn(process, "exit")
			.mockImplementation((() => undefined) as never);
		vi.spyOn(process.stdout, "write").mockImplementation((() => true) as never);

		exitAfterFlush(1);
		expect(exit).not.toHaveBeenCalled();

		vi.advanceTimersByTime(2_000);
		expect(exit).toHaveBeenCalledWith(1);
	});

	it("exits once when the drain callback and the timeout both fire", () => {
		vi.useFakeTimers();
		const exit = vi
			.spyOn(process, "exit")
			.mockImplementation((() => undefined) as never);
		let flush: (() => void) | undefined;
		vi.spyOn(process.stdout, "write").mockImplementation(((
			_chunk: string,
			callback: () => void,
		) => {
			flush = callback;
			return true;
		}) as never);

		exitAfterFlush(1);
		flush?.();
		vi.advanceTimersByTime(2_000);

		expect(exit).toHaveBeenCalledTimes(1);
	});
});
