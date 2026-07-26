import type { ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadConfig = vi.fn();
const mockRespondJson = vi.fn();

vi.mock("../../../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

import { sessionView } from "./sessionView";

type Body = { floatWaiting: boolean };

function run(): [ServerResponse, number, Body] {
	const res = {} as ServerResponse;
	sessionView({} as never, res);
	return mockRespondJson.mock.lastCall as [ServerResponse, number, Body];
}

describe("sessionView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadConfig.mockReturnValue({ sessions: {} });
	});

	it("reports floating off when sessions.floatWaiting is false", () => {
		mockLoadConfig.mockReturnValue({ sessions: { floatWaiting: false } });
		const [, status, body] = run();
		expect(status).toBe(200);
		expect(body).toEqual({ floatWaiting: false });
	});

	it("defaults floating on when the key is absent", () => {
		const [, , body] = run();
		expect(body).toEqual({ floatWaiting: true });
	});

	it("defaults floating on when there is no sessions config at all", () => {
		mockLoadConfig.mockReturnValue({});
		const [, , body] = run();
		expect(body).toEqual({ floatWaiting: true });
	});
});
