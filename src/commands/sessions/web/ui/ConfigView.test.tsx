// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { ConfigView } from "./ConfigView";
import { RepoSelectionContext } from "./useRepoSelectionContext";

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
			{ key: "commit.pull", type: "boolean", value: true, source: "project" },
			{
				key: "backup.dir",
				type: "string",
				value: "~/.assist/backups",
				source: "global",
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

	it("renders complex leaves as read-only formatted values", async () => {
		stubEntries([
			{
				key: "sql.connections",
				type: "array",
				value: [{ name: "local" }],
				source: "project",
			},
			{
				key: "branch.prefix",
				type: "string",
				value: undefined,
				source: "default",
			},
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("sql.connections")).toBeTruthy(),
		);
		expect(screen.getByText("array · read-only")).toBeTruthy();
		expect(screen.getByText(/"name": "local"/)).toBeTruthy();
		expect(screen.getByText("not set")).toBeTruthy();
	});

	it("shows the schema default and its source instead of 'not set'", async () => {
		stubEntries([
			{
				key: "worktree.enabled",
				type: "boolean",
				value: undefined,
				defaultValue: false,
				source: "default",
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
			{ key: "commit.push", type: "boolean", value: false, source: "project" },
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

	it("shows a rejected value in the snackbar and keeps the editor open", async () => {
		stubApi(
			[
				{
					key: "commit.push",
					type: "boolean",
					value: false,
					source: "project",
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

	it("does not offer editing for complex leaves", async () => {
		stubApi([
			{ key: "sql.connections", type: "array", value: [], source: "default" },
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("sql.connections")).toBeTruthy(),
		);
		expect(
			screen.queryByRole("button", { name: "Edit sql.connections" }),
		).toBeNull();
	});
});
