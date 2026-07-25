import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { findCommitAnchor } from "../../../shared/db/findCommitAnchor";
import { findItemBySessionId } from "../../../shared/db/findItemBySessionId";
import { getDb } from "../../../shared/db/getDb";
import { loadConfig } from "../../../shared/loadConfig";
import { sessionCommitAnchor } from "./sessionCommitAnchor";

vi.mock("../../../shared/db/findCommitAnchor", () => ({
	findCommitAnchor: vi.fn(),
}));
vi.mock("../../../shared/db/findItemBySessionId", () => ({
	findItemBySessionId: vi.fn(),
}));
vi.mock("../../../shared/db/getDb", () => ({ getDb: vi.fn() }));
vi.mock("../../../shared/loadConfig", () => ({ loadConfig: vi.fn() }));

const findCommitAnchorMock = vi.mocked(findCommitAnchor);
const findItemBySessionIdMock = vi.mocked(findItemBySessionId);
const getDbMock = vi.mocked(getDb);
const loadConfigMock = vi.mocked(loadConfig);

const db = {} as Awaited<ReturnType<typeof getDb>>;

function configuredUrl(url?: string): void {
	loadConfigMock.mockReturnValue({ database: { url } } as unknown as ReturnType<
		typeof loadConfig
	>);
}

function withDatabase(): void {
	configuredUrl("postgres://db");
	getDbMock.mockResolvedValue(db);
}

describe("sessionCommitAnchor", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		delete process.env.ASSIST_DATABASE_URL;
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("resolves the anchor recorded against the session's backlog item", async () => {
		withDatabase();
		findItemBySessionIdMock.mockResolvedValue(7);
		findCommitAnchorMock.mockResolvedValue({ commit: "first", parent: "base" });

		expect(await sessionCommitAnchor("found")).toEqual({
			commit: "first",
			parent: "base",
		});
		expect(findItemBySessionIdMock).toHaveBeenCalledWith(db, "found");
		expect(findCommitAnchorMock).toHaveBeenCalledWith(db, 7);
	});

	it("caches a resolved anchor instead of querying on every poll", async () => {
		withDatabase();
		findItemBySessionIdMock.mockResolvedValue(7);
		findCommitAnchorMock.mockResolvedValue({ commit: "first" });

		await sessionCommitAnchor("cached");
		await sessionCommitAnchor("cached");

		expect(findCommitAnchorMock).toHaveBeenCalledTimes(1);
	});

	it("shares one in-flight lookup between concurrent polls", async () => {
		withDatabase();
		findItemBySessionIdMock.mockResolvedValue(7);
		findCommitAnchorMock.mockResolvedValue({ commit: "first" });

		const [a, b] = await Promise.all([
			sessionCommitAnchor("concurrent"),
			sessionCommitAnchor("concurrent"),
		]);

		expect(a).toEqual(b);
		expect(findCommitAnchorMock).toHaveBeenCalledTimes(1);
	});

	it("returns nothing when no database is configured", async () => {
		configuredUrl();

		expect(await sessionCommitAnchor("no-db")).toEqual({});
		expect(getDbMock).not.toHaveBeenCalled();
	});

	it("returns nothing when the database is unreachable", async () => {
		withDatabase();
		getDbMock.mockRejectedValue(new Error("connection refused"));

		expect(await sessionCommitAnchor("unreachable")).toEqual({});
	});

	it("returns nothing when the session maps to no backlog item", async () => {
		withDatabase();
		findItemBySessionIdMock.mockResolvedValue(undefined);

		expect(await sessionCommitAnchor("orphan")).toEqual({});
		expect(findCommitAnchorMock).not.toHaveBeenCalled();
	});

	it("retries a session that had no commits once the cache entry expires", async () => {
		vi.useFakeTimers();
		withDatabase();
		findItemBySessionIdMock.mockResolvedValue(7);
		findCommitAnchorMock.mockResolvedValue({});

		expect(await sessionCommitAnchor("later")).toEqual({});
		await sessionCommitAnchor("later");
		expect(findCommitAnchorMock).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(30_001);
		findCommitAnchorMock.mockResolvedValue({ commit: "first" });

		expect(await sessionCommitAnchor("later")).toEqual({ commit: "first" });
	});
});
