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

import { sessionLayout } from "./sessionLayout";

type Body = { topBar: boolean };

function run(): [ServerResponse, number, Body] {
	const res = {} as ServerResponse;
	sessionLayout({} as never, res);
	return mockRespondJson.mock.lastCall as [ServerResponse, number, Body];
}

describe("sessionLayout", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadConfig.mockReturnValue({ sessions: {} });
	});

	it("reports the top bar on when sessions.topBar is set", () => {
		mockLoadConfig.mockReturnValue({ sessions: { topBar: true } });
		const [, status, body] = run();
		expect(status).toBe(200);
		expect(body).toEqual({ topBar: true });
	});

	it("reports the top bar off when sessions.topBar is false", () => {
		mockLoadConfig.mockReturnValue({ sessions: { topBar: false } });
		const [, , body] = run();
		expect(body).toEqual({ topBar: false });
	});

	it("defaults the top bar off when the key is absent", () => {
		const [, , body] = run();
		expect(body).toEqual({ topBar: false });
	});

	it("defaults the top bar off when there is no sessions config at all", () => {
		mockLoadConfig.mockReturnValue({});
		const [, , body] = run();
		expect(body).toEqual({ topBar: false });
	});
});
