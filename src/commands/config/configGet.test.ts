import { beforeEach, describe, expect, it, vi } from "vitest";
import { SECRET_MASK } from "../../shared/maskConfigSecrets";
import { configGet } from "./configGet";

const mockConfig = vi.fn<() => Record<string, unknown>>();

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => mockConfig(),
}));

function output(run: () => void): string {
	const lines: string[] = [];
	const log = vi.spyOn(console, "log").mockImplementation((line) => {
		lines.push(String(line));
	});
	try {
		run();
	} finally {
		log.mockRestore();
	}
	return lines.join("\n");
}

describe("configGet", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockConfig.mockReturnValue({
			database: { url: "postgres://user:pass@host/db" },
			commit: { push: true },
			sql: {
				connections: [{ name: "main", user: "sa", password: "hunter2" }],
			},
		});
	});

	it("masks a secret value", () => {
		expect(output(() => configGet("database.url"))).toBe(SECRET_MASK);
	});

	it("masks a secret nested in an array of objects", () => {
		expect(output(() => configGet("sql.connections"))).toContain(
			`"password": "${SECRET_MASK}"`,
		);
		expect(output(() => configGet("sql.connections"))).toContain(
			'"name": "main"',
		);
	});

	it("prints the raw value with --reveal", () => {
		expect(output(() => configGet("database.url", { reveal: true }))).toBe(
			"postgres://user:pass@host/db",
		);
	});

	it("prints non-secret values unchanged", () => {
		expect(output(() => configGet("commit.push"))).toBe("true");
	});

	it("reports an unset secret as not set", () => {
		mockConfig.mockReturnValue({ database: {} });
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const exit = vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("exit");
		}) as never);

		expect(() => configGet("database.url")).toThrow("exit");
		expect(error.mock.calls.join(" ")).toContain('"database.url" is not set');

		error.mockRestore();
		exit.mockRestore();
	});
});
