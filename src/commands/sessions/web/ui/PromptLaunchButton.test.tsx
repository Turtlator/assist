// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PromptLaunchButton } from "./PromptLaunchButton";

function mockHarness(capabilities: {
	exposeCodexActions?: boolean;
	exposePiActions?: boolean;
}) {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({ json: () => Promise.resolve(capabilities) }),
	);
}

function renderButton(handlers: {
	onCreate: (prompt: string, cwd: string) => void;
	onCreateHarness: (harness: string, prompt: string, cwd: string) => void;
}) {
	return render(
		<PromptLaunchButton
			cwd="/git/repo"
			disabled={false}
			onCreate={handlers.onCreate}
			onCreateHarness={handlers.onCreateHarness}
		/>,
	);
}

function openComposer() {
	fireEvent.click(screen.getByRole("button", { name: /prompt/i }));
}

function typeAndSubmit(prompt: string) {
	fireEvent.change(screen.getByRole("textbox"), { target: { value: prompt } });
	fireEvent.click(screen.getByRole("button", { name: "Start" }));
}

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("PromptLaunchButton", () => {
	it("launches Claude with no harness selector when nothing else is on PATH", async () => {
		mockHarness({ exposeCodexActions: false, exposePiActions: false });
		const onCreate = vi.fn();
		const onCreateHarness = vi.fn();
		renderButton({ onCreate, onCreateHarness });

		openComposer();
		await waitFor(() => expect(fetch).toHaveBeenCalled());
		expect(screen.queryAllByRole("radio")).toHaveLength(0);
		typeAndSubmit("go");

		expect(onCreate).toHaveBeenCalledWith("go", "/git/repo");
		expect(onCreateHarness).not.toHaveBeenCalled();
	});

	it("launches the selected harness when codex is exposed", async () => {
		mockHarness({ exposeCodexActions: true, exposePiActions: false });
		const onCreate = vi.fn();
		const onCreateHarness = vi.fn();
		renderButton({ onCreate, onCreateHarness });

		openComposer();
		const codex = await screen.findByRole("radio", { name: "Codex" });
		fireEvent.click(codex);
		typeAndSubmit("go");

		expect(onCreateHarness).toHaveBeenCalledWith("codex", "go", "/git/repo");
		expect(onCreate).not.toHaveBeenCalled();
	});

	it("still launches Claude when Claude stays selected", async () => {
		mockHarness({ exposeCodexActions: true, exposePiActions: true });
		const onCreate = vi.fn();
		const onCreateHarness = vi.fn();
		renderButton({ onCreate, onCreateHarness });

		openComposer();
		await screen.findByRole("radio", { name: "Codex" });
		typeAndSubmit("go");

		expect(onCreate).toHaveBeenCalledWith("go", "/git/repo");
		expect(onCreateHarness).not.toHaveBeenCalled();
	});
});
