// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { describeConfigNode } from "../../../../shared/describeConfigNode";
import { assistConfigSchema } from "../../../../shared/types";
import { configEntryNode } from "../../../config/configEntryNode";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { ConfigView } from "./ConfigView";
import { RepoSelectionContext } from "./useRepoSelectionContext";

const schema = describeConfigNode(assistConfigSchema);

function node(key: string) {
	return configEntryNode(schema, key);
}

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function stubEntries(entries: ConfigEntry[], ok = true) {
	const fetchMock = vi.fn().mockResolvedValue({
		ok,
		status: ok ? 200 : 500,
		json: async () => (ok ? entries : { error: "boom" }),
	});
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

type SetResponse = { ok: boolean; status: number; body: unknown };

const SET_OK: SetResponse = {
	ok: true,
	status: 200,
	body: { target: "project" },
};

function stubApi(entries: ConfigEntry[], setResponse: SetResponse = SET_OK) {
	const fetchMock = vi.fn(async (url: string, _init?: RequestInit) =>
		url.startsWith("/api/config/set")
			? {
					ok: setResponse.ok,
					status: setResponse.status,
					json: async () => setResponse.body,
				}
			: { ok: true, status: 200, json: async () => entries },
	);
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

function lastSetBody(fetchMock: ReturnType<typeof stubApi>): unknown {
	const call = fetchMock.mock.calls.find(([url]) =>
		String(url).startsWith("/api/config/set"),
	);
	const init = call?.[1] as RequestInit | undefined;
	return JSON.parse(String(init?.body));
}

function renderView(selectedCwd = "/repo") {
	render(
		<RepoSelectionContext.Provider
			value={{ repos: [], selectedCwd, setSelectedCwd: vi.fn() }}
		>
			<ConfigView />
		</RepoSelectionContext.Provider>,
	);
}

describe("ConfigView", () => {
	it("requests the config for the selected cwd and lists grouped keys", async () => {
		const fetchMock = stubEntries([
			{
				key: "commit.pull",
				type: "boolean",
				value: true,
				source: "project",
				node: node("commit.pull"),
			},
			{
				key: "backup.dir",
				type: "string",
				value: "~/.assist/backups",
				source: "global",
				node: node("backup.dir"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("backup.dir")).toBeTruthy());
		expect(fetchMock).toHaveBeenCalledWith("/api/config?cwd=%2Frepo%2Fone");
		expect(screen.getByText("~/.assist/backups")).toBeTruthy();
		expect(screen.getByText("true")).toBeTruthy();
		expect(screen.getByText("backup")).toBeTruthy();
		expect(screen.getByText("commit")).toBeTruthy();
	});

	it("renders a complex leaf structurally and an unset leaf as not set", async () => {
		stubEntries([
			{
				key: "sql.connections",
				type: "array",
				value: [{ name: "local" }],
				source: "project",
				node: node("sql.connections"),
			},
			{
				key: "branch.prefix",
				type: "string",
				value: undefined,
				source: "default",
				node: node("branch.prefix"),
			},
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("sql.connections")).toBeTruthy(),
		);
		expect(screen.queryByText(/"name": "local"/)).toBeNull();
		expect(screen.getByText("local")).toBeTruthy();
		expect(screen.getByText("not set")).toBeTruthy();
	});

	it("renders a complex leaf from its descriptor, keeping source and default", async () => {
		stubEntries([
			{
				key: "voice.wakeWords",
				type: "array",
				itemType: "string",
				value: undefined,
				defaultValue: ["hey assist"],
				source: "default",
				node: node("voice.wakeWords"),
			},
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("voice.wakeWords")).toBeTruthy(),
		);
		expect(screen.getByText("hey assist")).toBeTruthy();
		expect(screen.getByText("default")).toBeTruthy();
		expect(screen.queryByText(/\[/)).toBeNull();
	});

	it("shows the schema default and its source instead of 'not set'", async () => {
		stubEntries([
			{
				key: "worktree.enabled",
				type: "boolean",
				value: undefined,
				defaultValue: false,
				source: "default",
				node: node("worktree.enabled"),
			},
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("worktree.enabled")).toBeTruthy(),
		);
		expect(screen.getByText("false")).toBeTruthy();
		expect(screen.getByText("default")).toBeTruthy();
		expect(screen.queryByText("not set")).toBeNull();
	});

	it("shows the server error instead of rows when the fetch fails", async () => {
		stubEntries([], false);
		renderView();

		await waitFor(() => expect(screen.getByText("boom")).toBeTruthy());
	});

	it("saves a boolean edit to the project config and refetches", async () => {
		const fetchMock = stubApi([
			{
				key: "commit.push",
				type: "boolean",
				value: false,
				source: "project",
				node: node("commit.push"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("commit.push")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit commit.push" }));
		fireEvent.click(screen.getByLabelText("commit.push value"));
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "commit.push",
				value: true,
				cwd: "/repo/one",
				scope: "project",
			}),
		);
		await waitFor(() =>
			expect(
				fetchMock.mock.calls.filter(
					([url]) => url === "/api/config?cwd=%2Frepo%2Fone",
				),
			).toHaveLength(2),
		);
	});

	it("writes to the global config when the global scope is picked", async () => {
		const fetchMock = stubApi([
			{
				key: "backup.dir",
				type: "string",
				value: "~/.assist/backups",
				source: "global",
				node: node("backup.dir"),
			},
		]);
		renderView();

		await waitFor(() => expect(screen.getByText("backup.dir")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit backup.dir" }));
		fireEvent.change(screen.getByLabelText("backup.dir"), {
			target: { value: "~/elsewhere" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Global" }));
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "backup.dir",
				value: "~/elsewhere",
				cwd: "/repo",
				scope: "global",
			}),
		);
	});

	it("forces a global write for a global-only key", async () => {
		const fetchMock = stubApi(
			[
				{
					key: "sync.autoConfirm",
					type: "boolean",
					value: false,
					source: "global",
					globalOnly: true,
					node: node("sync.autoConfirm"),
				},
			],
			{ ok: true, status: 200, body: { target: "global" } },
		);
		renderView("/repo/one");

		await waitFor(() =>
			expect(screen.getByText("sync.autoConfirm")).toBeTruthy(),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Edit sync.autoConfirm" }),
		);
		const project = screen.getByRole("button", { name: "Project" });
		expect(project.hasAttribute("disabled")).toBe(true);
		expect(
			screen
				.getByRole("button", { name: "Global" })
				.getAttribute("aria-pressed"),
		).toBe("true");

		fireEvent.click(screen.getByLabelText("sync.autoConfirm value"));
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "sync.autoConfirm",
				value: true,
				cwd: "/repo/one",
				scope: "global",
			}),
		);
	});

	it("shows a rejected value in the snackbar and keeps the editor open", async () => {
		stubApi(
			[
				{
					key: "commit.push",
					type: "boolean",
					value: false,
					source: "project",
					node: node("commit.push"),
				},
			],
			{
				ok: false,
				status: 400,
				body: { error: "commit.push: expected boolean" },
			},
		);
		renderView();

		await waitFor(() => expect(screen.getByText("commit.push")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit commit.push" }));
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(screen.getByText("commit.push: expected boolean")).toBeTruthy(),
		);
		expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
	});

	it("offers the schema's options when editing an enum key", async () => {
		stubApi([
			{
				key: "sessions.windowsVersionCheck",
				type: "enum",
				enumValues: ["block", "warn", "off"],
				value: "block",
				source: "default",
				node: node("sessions.windowsVersionCheck"),
			},
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("sessions.windowsVersionCheck")).toBeTruthy(),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Edit sessions.windowsVersionCheck" }),
		);
		fireEvent.mouseDown(screen.getByRole("combobox"));

		expect(screen.getByRole("option", { name: "warn" })).toBeTruthy();
	});

	it("edits a scalar union as text and lists the accepted types", async () => {
		const fetchMock = stubApi([
			{
				key: "worktree.install",
				type: "union",
				unionTypes: ["boolean", "string"],
				value: undefined,
				defaultValue: true,
				source: "default",
				node: node("worktree.install"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() =>
			expect(screen.getByText("worktree.install")).toBeTruthy(),
		);
		expect(screen.queryByText("union · read-only")).toBeNull();
		fireEvent.click(
			screen.getByRole("button", { name: "Edit worktree.install" }),
		);
		expect(screen.getByText("boolean or string")).toBeTruthy();
		expect(screen.getByLabelText("worktree.install")).toHaveProperty(
			"value",
			"true",
		);
		fireEvent.change(screen.getByLabelText("worktree.install"), {
			target: { value: "pnpm install" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "worktree.install",
				value: "pnpm install",
				cwd: "/repo/one",
				scope: "project",
			}),
		);
	});

	it("edits an array of scalars as one entry per line", async () => {
		const fetchMock = stubApi([
			{
				key: "worktree.copy",
				type: "array",
				itemType: "string",
				value: [".env"],
				source: "project",
				node: node("worktree.copy"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("worktree.copy")).toBeTruthy());
		expect(screen.queryByText("array · read-only")).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Edit worktree.copy" }));
		expect(screen.getByLabelText("worktree.copy")).toHaveProperty(
			"value",
			".env",
		);
		fireEvent.change(screen.getByLabelText("worktree.copy"), {
			target: { value: ".env\n settings.local.json \n\n" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "worktree.copy",
				value: [".env", "settings.local.json"],
				cwd: "/repo/one",
				scope: "project",
			}),
		);
	});

	it("adds an entry to an array of objects and posts the typed fields", async () => {
		const fetchMock = stubApi([
			{
				key: "sql.connections",
				type: "array",
				value: [],
				source: "default",
				node: node("sql.connections"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() =>
			expect(screen.getByText("sql.connections")).toBeTruthy(),
		);
		expect(screen.queryByText("array · read-only")).toBeNull();
		fireEvent.click(
			screen.getByRole("button", { name: "Edit sql.connections" }),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Add sql.connections entry" }),
		);
		fireEvent.change(screen.getByLabelText("sql.connections[0].name"), {
			target: { value: "local" },
		});
		fireEvent.change(screen.getByLabelText("sql.connections[0].port"), {
			target: { value: "1433" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "sql.connections",
				value: [{ name: "local", port: 1433 }],
				cwd: "/repo/one",
				scope: "project",
			}),
		);
	});

	it("reorders entries in an array of objects", async () => {
		const fetchMock = stubApi([
			{
				key: "run",
				type: "array",
				value: [
					{ name: "build", command: "npm" },
					{ name: "test", command: "vitest" },
				],
				source: "project",
				node: node("run"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("run")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit run" }));
		fireEvent.click(screen.getByRole("button", { name: "Move run[1] up" }));
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "run",
				value: [
					{ name: "test", command: "vitest" },
					{ name: "build", command: "npm" },
				],
				cwd: "/repo/one",
				scope: "project",
			}),
		);
	});

	it("adds a key/value row to a record", async () => {
		const fetchMock = stubApi([
			{
				key: "cliReadVerbs",
				type: "record",
				value: { docker: ["ps"] },
				source: "project",
				node: node("cliReadVerbs"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("cliReadVerbs")).toBeTruthy());
		expect(screen.queryByText("record · read-only")).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Edit cliReadVerbs" }));
		fireEvent.click(
			screen.getByRole("button", { name: "Add cliReadVerbs entry" }),
		);
		fireEvent.change(screen.getByLabelText("cliReadVerbs key 2"), {
			target: { value: "kubectl" },
		});
		fireEvent.change(screen.getByLabelText("cliReadVerbs.kubectl"), {
			target: { value: "get" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "cliReadVerbs",
				value: { docker: ["ps"], kubectl: ["get"] },
				cwd: "/repo/one",
				scope: "project",
			}),
		);
	});

	it("keeps a leaf the schema does not describe read-only", async () => {
		stubApi([
			{ key: "sql.connections", type: "array", value: [], source: "default" },
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("sql.connections")).toBeTruthy(),
		);
		expect(screen.getByText("array · read-only")).toBeTruthy();
		expect(
			screen.queryByRole("button", { name: "Edit sql.connections" }),
		).toBeNull();
	});
});
