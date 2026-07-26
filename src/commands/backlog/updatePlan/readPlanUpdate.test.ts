import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readPlanUpdate } from "./readPlanUpdate";

function writePayload(content: unknown): string {
	const dir = mkdtempSync(join(tmpdir(), "assist-plan-"));
	const file = join(dir, "plan.json");
	writeFileSync(file, JSON.stringify(content));
	return file;
}

function expectFailure() {
	const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	vi.spyOn(process, "exit").mockImplementation((() => {
		throw new Error("process.exit");
	}) as never);
	return errorSpy;
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("readPlanUpdate", () => {
	it("reads phases with their tasks and manual checks", async () => {
		expect(
			await readPlanUpdate(
				writePayload({
					phases: [
						{ name: "Wire it up", tasks: ["Add the command"] },
						{
							name: "Polish",
							tasks: ["Tidy the body"],
							manualChecks: ["Open the pane"],
						},
					],
				}),
			),
		).toEqual({
			phases: [
				{ name: "Wire it up", tasks: ["Add the command"], manualChecks: [] },
				{
					name: "Polish",
					tasks: ["Tidy the body"],
					manualChecks: ["Open the pane"],
				},
			],
		});
	});

	it("exits non-zero on an empty plan", async () => {
		const errorSpy = expectFailure();

		await expect(readPlanUpdate(writePayload({ phases: [] }))).rejects.toThrow(
			"process.exit",
		);
		expect(errorSpy.mock.calls.join("\n")).toContain("at least one phase");
	});

	it("exits non-zero when a phase has no tasks", async () => {
		const errorSpy = expectFailure();

		await expect(
			readPlanUpdate(writePayload({ phases: [{ name: "Empty", tasks: [] }] })),
		).rejects.toThrow("process.exit");
		expect(errorSpy.mock.calls.join("\n")).toContain("at least one task");
	});

	it("exits non-zero on an unknown field", async () => {
		const errorSpy = expectFailure();

		await expect(
			readPlanUpdate(
				writePayload({
					phases: [{ name: "P", tasks: ["t"] }],
					currentPhase: 1,
				}),
			),
		).rejects.toThrow("process.exit");
		expect(errorSpy.mock.calls.join("\n")).toContain("currentPhase");
	});
});
