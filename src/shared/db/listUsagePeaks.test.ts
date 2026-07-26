import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
import type { RateLimits } from "../RateLimits";
import { countUsagePeaks } from "./countUsagePeaks";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { listUsagePeaks } from "./listUsagePeaks";
import { recordPhaseCycleContext } from "./recordPhaseCycleContext";
import { recordUsagePeak } from "./recordUsagePeak";
import { items, phaseCycleContext, usagePeaks } from "./schema";

describe("listUsagePeaks", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeAll(async () => {
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await orm.delete(usagePeaks);
		await orm.delete(phaseCycleContext);
		await orm.delete(items);
	});

	afterAll(async () => {
		await close();
	});

	const NOW = 100;
	const record = (rateLimits: RateLimits) =>
		recordUsagePeak(orm, rateLimits, NOW);

	describe("when no peaks have been recorded", () => {
		it("returns an empty list", async () => {
			expect(await listUsagePeaks(orm)).toEqual([]);
		});
	});

	describe("when peaks span several cycles", () => {
		it("returns them newest cycle first", async () => {
			await record({
				five_hour: { used_percentage: 10, resets_at: 1000 },
			});
			await record({
				five_hour: { used_percentage: 20, resets_at: 3000 },
			});
			await record({
				seven_day: { used_percentage: 30, resets_at: 2000 },
			});

			expect(await listUsagePeaks(orm)).toEqual([
				{
					window: "five_hour",
					resetsAt: 3000,
					segment: 0,
					usedPercentage: 20,
					resetDetected: false,
					tokensUp: 0,
					tokensDown: 0,
					avgContextPct: null,
					phaseCount: null,
					createdAt: expect.any(Date),
				},
				{
					window: "seven_day",
					resetsAt: 2000,
					segment: 0,
					usedPercentage: 30,
					resetDetected: false,
					tokensUp: 0,
					tokensDown: 0,
					avgContextPct: null,
					phaseCount: null,
					createdAt: expect.any(Date),
				},
				{
					window: "five_hour",
					resetsAt: 1000,
					segment: 0,
					usedPercentage: 10,
					resetDetected: false,
					tokensUp: 0,
					tokensDown: 0,
					avgContextPct: null,
					phaseCount: null,
					createdAt: expect.any(Date),
				},
			]);
		});
	});

	describe("when a cycle was reset mid-window", () => {
		it("returns the post-reset continuation before its pre-reset peak", async () => {
			await record({
				seven_day: { used_percentage: 35, resets_at: 2000 },
			});
			await record({
				seven_day: { used_percentage: 8, resets_at: 2000 },
			});

			expect(await listUsagePeaks(orm)).toEqual([
				{
					window: "seven_day",
					resetsAt: 2000,
					segment: 1,
					usedPercentage: 8,
					resetDetected: false,
					tokensUp: 0,
					tokensDown: 0,
					avgContextPct: null,
					phaseCount: null,
					createdAt: expect.any(Date),
				},
				{
					window: "seven_day",
					resetsAt: 2000,
					segment: 0,
					usedPercentage: 35,
					resetDetected: true,
					tokensUp: 0,
					tokensDown: 0,
					avgContextPct: null,
					phaseCount: null,
					createdAt: expect.any(Date),
				},
			]);
		});
	});

	describe("when both windows share a reset time", () => {
		it("orders them by window for a deterministic result", async () => {
			await record({
				five_hour: { used_percentage: 40, resets_at: 5000 },
				seven_day: { used_percentage: 60, resets_at: 5000 },
			});

			expect(await listUsagePeaks(orm)).toEqual([
				{
					window: "five_hour",
					resetsAt: 5000,
					segment: 0,
					usedPercentage: 40,
					resetDetected: false,
					tokensUp: 0,
					tokensDown: 0,
					avgContextPct: null,
					phaseCount: null,
					createdAt: expect.any(Date),
				},
				{
					window: "seven_day",
					resetsAt: 5000,
					segment: 0,
					usedPercentage: 60,
					resetDetected: false,
					tokensUp: 0,
					tokensDown: 0,
					avgContextPct: null,
					phaseCount: null,
					createdAt: expect.any(Date),
				},
			]);
		});
	});

	describe("when paging", () => {
		beforeEach(async () => {
			for (const resets_at of [1000, 2000, 3000, 4000, 5000]) {
				await record({
					five_hour: { used_percentage: resets_at / 100, resets_at },
				});
			}
		});

		it("returns the requested slice in the deterministic order", async () => {
			const page0 = await listUsagePeaks(orm, { limit: 2, offset: 0 });
			const page1 = await listUsagePeaks(orm, { limit: 2, offset: 2 });
			const page2 = await listUsagePeaks(orm, { limit: 2, offset: 4 });

			expect(page0.map((r) => r.resetsAt)).toEqual([5000, 4000]);
			expect(page1.map((r) => r.resetsAt)).toEqual([3000, 2000]);
			expect(page2.map((r) => r.resetsAt)).toEqual([1000]);
		});

		it("counts every recorded peak", async () => {
			expect(await countUsagePeaks(orm)).toBe(5);
		});
	});

	describe("when no peaks have been recorded", () => {
		it("counts zero", async () => {
			expect(await countUsagePeaks(orm)).toBe(0);
		});
	});

	describe("when filtering by window", () => {
		beforeEach(async () => {
			await record({
				five_hour: { used_percentage: 10, resets_at: 1000 },
				seven_day: { used_percentage: 15, resets_at: 1000 },
			});
			await record({
				five_hour: { used_percentage: 20, resets_at: 2000 },
			});
			await record({
				seven_day: { used_percentage: 25, resets_at: 3000 },
			});
		});

		it("lists only the five hour peaks", async () => {
			const rows = await listUsagePeaks(orm, { window: "five_hour" });

			expect(rows.map((r) => [r.window, r.resetsAt])).toEqual([
				["five_hour", 2000],
				["five_hour", 1000],
			]);
		});

		it("lists only the seven day peaks", async () => {
			const rows = await listUsagePeaks(orm, { window: "seven_day" });

			expect(rows.map((r) => [r.window, r.resetsAt])).toEqual([
				["seven_day", 3000],
				["seven_day", 1000],
			]);
		});

		it("pages within the filtered window", async () => {
			const page0 = await listUsagePeaks(orm, {
				window: "seven_day",
				limit: 1,
				offset: 0,
			});
			const page1 = await listUsagePeaks(orm, {
				window: "seven_day",
				limit: 1,
				offset: 1,
			});

			expect(page0.map((r) => r.resetsAt)).toEqual([3000]);
			expect(page1.map((r) => r.resetsAt)).toEqual([1000]);
		});

		it("counts only the peaks in the given window", async () => {
			expect(await countUsagePeaks(orm, "five_hour")).toBe(2);
			expect(await countUsagePeaks(orm, "seven_day")).toBe(2);
			expect(await countUsagePeaks(orm)).toBe(4);
		});
	});

	describe("when only one window has peaks", () => {
		it("returns nothing for the other window", async () => {
			await record({
				five_hour: { used_percentage: 10, resets_at: 1000 },
			});

			expect(await listUsagePeaks(orm, { window: "seven_day" })).toEqual([]);
			expect(await countUsagePeaks(orm, "seven_day")).toBe(0);
		});
	});

	describe("avg context per cycle", () => {
		beforeEach(async () => {
			await orm.insert(items).values({ id: 1, origin: "test", name: "Item" });
		});

		it("reports the mean of the cycle's per-phase peaks", async () => {
			await record({
				five_hour: { used_percentage: 40, resets_at: 1000 },
			});
			await recordPhaseCycleContext(orm, 1, 0, "five_hour", 1000, 30);
			await recordPhaseCycleContext(orm, 1, 1, "five_hour", 1000, 50);

			const [row] = await listUsagePeaks(orm);
			expect(row?.avgContextPct).toBe(40);
			expect(row?.phaseCount).toBe(2);
		});

		it("leaves avgContextPct and phaseCount null for a cycle with no readings", async () => {
			await record({
				five_hour: { used_percentage: 40, resets_at: 1000 },
			});

			const [row] = await listUsagePeaks(orm);
			expect(row?.avgContextPct).toBeNull();
			expect(row?.phaseCount).toBeNull();
		});
	});
});
