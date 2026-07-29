import { describe, expect, it } from "vitest";
import {
	type DiffPanelMap,
	toggleDiffPanel,
	toggleDiffPanelMode,
} from "./toggleDiffPanel";

const target = { cwd: "/repo", claudeSessionId: "sess-1", scope: "all" };

describe("diff panel mode", () => {
	it("opens a new panel in half mode", () => {
		expect(toggleDiffPanel({}, "card-1", target)["card-1"]?.mode).toBe("half");
	});

	it("switches half to full and back", () => {
		const half = toggleDiffPanel({}, "card-1", target);

		const full = toggleDiffPanelMode(half, "card-1");
		expect(full["card-1"]?.mode).toBe("full");

		expect(toggleDiffPanelMode(full, "card-1")["card-1"]?.mode).toBe("half");
	});

	it("keeps the mode when the panel switches scope", () => {
		const full = toggleDiffPanelMode(
			toggleDiffPanel({}, "card-1", target),
			"card-1",
		);

		const switched = toggleDiffPanel(full, "card-1", {
			...target,
			scope: "uncommitted",
		});

		expect(switched["card-1"]).toEqual({
			...target,
			scope: "uncommitted",
			mode: "full",
		});
	});

	it("leaves the map untouched for a session with no panel", () => {
		const panels: DiffPanelMap = {};

		expect(toggleDiffPanelMode(panels, "card-1")).toBe(panels);
	});

	it("does not disturb another session's mode", () => {
		const both = toggleDiffPanel(
			toggleDiffPanel({}, "card-1", target),
			"card-2",
			target,
		);

		const toggled = toggleDiffPanelMode(both, "card-1");

		expect(toggled["card-2"]?.mode).toBe("half");
	});
});
