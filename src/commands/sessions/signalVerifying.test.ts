import type { Socket } from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectToDaemon } from "./daemon/connectToDaemon";
import { signalVerifying } from "./signalVerifying";

vi.mock("./daemon/connectToDaemon", () => ({ connectToDaemon: vi.fn() }));

const connectMock = connectToDaemon as unknown as ReturnType<typeof vi.fn>;

function fakeSocket() {
	return {
		on: vi.fn(),
		unref: vi.fn(),
		write: vi.fn(),
		destroy: vi.fn(),
	} as unknown as Socket & {
		on: ReturnType<typeof vi.fn>;
		unref: ReturnType<typeof vi.fn>;
		write: ReturnType<typeof vi.fn>;
		destroy: ReturnType<typeof vi.fn>;
	};
}

const originalId = process.env.ASSIST_SESSION_ID;

describe("signalVerifying", () => {
	beforeEach(() => {
		connectMock.mockReset();
		process.env.ASSIST_SESSION_ID = "7";
	});

	afterEach(() => {
		if (originalId === undefined) delete process.env.ASSIST_SESSION_ID;
		else process.env.ASSIST_SESSION_ID = originalId;
	});

	it("does not touch the daemon when run outside a session", () => {
		delete process.env.ASSIST_SESSION_ID;

		expect(() => signalVerifying()()).not.toThrow();
		expect(connectMock).not.toHaveBeenCalled();
	});

	it("stays silent when no daemon is listening", async () => {
		connectMock.mockRejectedValue(new Error("ENOENT"));
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const error = vi.spyOn(console, "error").mockImplementation(() => {});

		const release = signalVerifying();
		await Promise.resolve();

		expect(warn).not.toHaveBeenCalled();
		expect(error).not.toHaveBeenCalled();
		expect(() => release()).not.toThrow();
		warn.mockRestore();
		error.mockRestore();
	});

	it("announces the session and leaves the socket unref'd", async () => {
		const socket = fakeSocket();
		connectMock.mockResolvedValue(socket);

		signalVerifying();
		await Promise.resolve();

		expect(socket.write).toHaveBeenCalledWith(
			`${JSON.stringify({ type: "verify-started", sessionId: "7" })}\n`,
		);
		expect(socket.unref).toHaveBeenCalled();
	});

	it("closes the held connection when verify finishes", async () => {
		const socket = fakeSocket();
		connectMock.mockResolvedValue(socket);

		const release = signalVerifying();
		await Promise.resolve();
		release();

		expect(socket.destroy).toHaveBeenCalled();
	});

	it("drops a connection that lands after verify has already finished", async () => {
		const socket = fakeSocket();
		connectMock.mockResolvedValue(socket);

		signalVerifying()();
		await Promise.resolve();

		expect(socket.write).not.toHaveBeenCalled();
		expect(socket.destroy).toHaveBeenCalled();
	});
});
