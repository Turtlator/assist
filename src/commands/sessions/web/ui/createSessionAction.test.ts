import { describe, expect, it, vi } from "vitest";
import {
	createAssistSessionAction,
	dismissSessionAction,
	outputAction,
	restartSessionAction,
} from "./createSessionAction";
import { handleClear } from "./handleClear";
import { handleOutput } from "./handleOutput";
import type { WsDispatch } from "./WsDispatch";

function terminalState() {
	const buffers = new Map<string, string>();
	const handlers = new Map<string, (data: string) => void>();
	const written: string[] = [];
	const unsubscribe = outputAction(buffers, handlers)("5", (data) =>
		written.push(data),
	);
	const dispatch = {
		buffers: { current: buffers },
		handlers: { current: handlers },
		markInitialized: vi.fn(),
	} as unknown as WsDispatch;
	return { buffers, written, unsubscribe, dispatch };
}

describe("createAssistSessionAction", () => {
	it("carries the launching card's id so the new session nests under it", () => {
		const send = vi.fn();

		createAssistSessionAction(send)(["review", "42"], "/git/repo", {
			title: "PR #42",
			inPlace: true,
			launchedFrom: "7",
		});

		expect(send).toHaveBeenCalledWith({
			type: "create-assist",
			assistArgs: ["review", "42"],
			cwd: "/git/repo",
			title: "PR #42",
			inPlace: true,
			launchedFrom: "7",
		});
	});

	it("sends no launcher when there is no launching card", () => {
		const send = vi.fn();

		createAssistSessionAction(send)(["review", "42"], "/git/repo", {
			title: "PR #42",
		});

		expect(send).toHaveBeenCalledWith({
			type: "create-assist",
			assistArgs: ["review", "42"],
			cwd: "/git/repo",
			title: "PR #42",
		});
	});
});

describe("dismissSessionAction", () => {
	it("keeps a refused dismiss subscribed so a restart redraws the pane", () => {
		const send = vi.fn();
		const { buffers, written, dispatch } = terminalState();

		dismissSessionAction(send, buffers)("5");
		restartSessionAction(send, buffers)("5");
		handleClear({ sessionId: "5" }, dispatch);
		handleOutput({ sessionId: "5", data: "resumed" }, dispatch);

		expect(send).toHaveBeenCalledWith({ type: "dismiss", sessionId: "5" });
		expect(written).toEqual(["\x1bc", "resumed"]);
	});

	it("stops writing once the pane unmounts", () => {
		const send = vi.fn();
		const { buffers, written, unsubscribe, dispatch } = terminalState();

		dismissSessionAction(send, buffers)("5");
		unsubscribe();
		handleOutput({ sessionId: "5", data: "resumed" }, dispatch);

		expect(written).toEqual([]);
	});
});
