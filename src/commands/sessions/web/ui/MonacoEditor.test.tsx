// @vitest-environment jsdom
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadMonaco, type MonacoApi } from "./loadMonaco";
import { MonacoEditor } from "./MonacoEditor";

vi.mock("./loadMonaco", () => ({ loadMonaco: vi.fn() }));

type CreateOptions = {
	value: string;
	language: string;
	theme: string;
	readOnly: boolean;
};

let buffer = "";
const model = { dispose: vi.fn() };
const instance = {
	getValue: () => buffer,
	setValue: vi.fn((next: string) => {
		buffer = next;
	}),
	getModel: () => model,
	updateOptions: vi.fn(),
	dispose: vi.fn(),
};
const create = vi.fn((_element: HTMLElement, options: CreateOptions) => {
	buffer = options.value;
	return instance;
});
const setTheme = vi.fn();
const setModelLanguage = vi.fn();
const api = {
	editor: { create, setTheme, setModelLanguage },
} as unknown as MonacoApi;

function createdWith(): CreateOptions {
	const options = create.mock.calls.at(-1)?.[1];
	if (!options) throw new Error("the editor was never created");
	return options;
}

function wrapper(mode: "light" | "dark") {
	return ({ children }: { children: ReactNode }) => (
		<ThemeProvider theme={createTheme({ palette: { mode } })}>
			{children}
		</ThemeProvider>
	);
}

beforeEach(() => {
	vi.clearAllMocks();
	buffer = "";
	vi.mocked(loadMonaco).mockResolvedValue(api);
});

afterEach(cleanup);

describe("MonacoEditor", () => {
	it("creates the editor with the value, language and read-only flag", async () => {
		render(
			<MonacoEditor
				value="const a = 1;"
				language="typescript"
				readOnly
				height="100px"
			/>,
		);

		await waitFor(() => expect(create).toHaveBeenCalled());
		expect(createdWith()).toMatchObject({
			value: "const a = 1;",
			language: "typescript",
			readOnly: true,
		});
	});

	it("defaults an unknown language to plain text", async () => {
		render(<MonacoEditor value="plain" height="100px" />);

		await waitFor(() => expect(create).toHaveBeenCalled());
		expect(createdWith().language).toBe("plaintext");
	});

	it("creates the editor with the light theme", async () => {
		render(<MonacoEditor value="a" height="100px" />, {
			wrapper: wrapper("light"),
		});

		await waitFor(() => expect(create).toHaveBeenCalled());
		expect(createdWith().theme).toBe("vs");
	});

	it("creates the editor with the dark theme", async () => {
		render(<MonacoEditor value="a" height="100px" />, {
			wrapper: wrapper("dark"),
		});

		await waitFor(() => expect(create).toHaveBeenCalled());
		expect(createdWith().theme).toBe("vs-dark");
	});

	it("recolours the editor when the colour mode changes", async () => {
		const themed = (mode: "light" | "dark") => (
			<ThemeProvider theme={createTheme({ palette: { mode } })}>
				<MonacoEditor value="a" height="100px" />
			</ThemeProvider>
		);
		const view = render(themed("light"));

		await waitFor(() => expect(create).toHaveBeenCalled());
		view.rerender(themed("dark"));

		expect(setTheme).toHaveBeenCalledWith("vs-dark");
	});

	it("pushes a changed value into the open editor", async () => {
		const view = render(<MonacoEditor value="a" height="100px" />);

		await waitFor(() => expect(create).toHaveBeenCalled());
		view.rerender(<MonacoEditor value="b" height="100px" />);

		expect(instance.setValue).toHaveBeenCalledWith("b");
	});

	it("leaves the editor alone when the value already matches", async () => {
		const view = render(<MonacoEditor value="a" height="100px" />);

		await waitFor(() => expect(create).toHaveBeenCalled());
		view.rerender(<MonacoEditor value="a" height="100px" />);

		expect(instance.setValue).not.toHaveBeenCalled();
	});

	it("switches the model language when the file changes", async () => {
		const view = render(
			<MonacoEditor value="a" language="typescript" height="100px" />,
		);

		await waitFor(() => expect(create).toHaveBeenCalled());
		view.rerender(<MonacoEditor value="a" language="yaml" height="100px" />);

		expect(setModelLanguage).toHaveBeenCalledWith(model, "yaml");
	});

	it("disposes the editor and its model on unmount", async () => {
		const view = render(<MonacoEditor value="a" height="100px" />);

		await waitFor(() => expect(create).toHaveBeenCalled());
		view.unmount();

		expect(model.dispose).toHaveBeenCalled();
		expect(instance.dispose).toHaveBeenCalled();
	});

	it("reports a bundle that fails to load", async () => {
		vi.mocked(loadMonaco).mockRejectedValue(new Error("offline"));

		render(<MonacoEditor value="a" height="100px" />);

		expect(await screen.findByText("The editor failed to load.")).toBeTruthy();
	});
});
