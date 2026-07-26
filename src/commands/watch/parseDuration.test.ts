import { describe, expect, it } from "vitest";
import { parseDuration } from "./parseDuration";

describe("parseDuration", () => {
	it("converts seconds, minutes, and hours to milliseconds", () => {
		expect(parseDuration("30s")).toBe(30_000);
		expect(parseDuration("60m")).toBe(3_600_000);
		expect(parseDuration("2h")).toBe(7_200_000);
	});

	it("accepts surrounding whitespace", () => {
		expect(parseDuration("  15m ")).toBe(900_000);
	});

	it("rejects a missing unit", () => {
		expect(() => parseDuration("30")).toThrow(/Invalid duration "30"/);
	});

	it("rejects an unknown unit", () => {
		expect(() => parseDuration("5d")).toThrow(/Invalid duration "5d"/);
	});

	it("rejects a fractional value", () => {
		expect(() => parseDuration("1.5h")).toThrow(/Invalid duration "1.5h"/);
	});

	it("rejects an empty string", () => {
		expect(() => parseDuration("")).toThrow(/Invalid duration/);
	});

	it("rejects zero", () => {
		expect(() => parseDuration("0m")).toThrow(/must be at least 1/);
	});
});
