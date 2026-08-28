import { beforeEach, describe, expect, it, vi } from "vitest";

const runGhGraphqlJson = vi.fn();
const readGhTokenScopes = vi.fn();

vi.mock("../../../shared/runGhGraphqlJson", () => ({
	runGhGraphqlJson: (...args: unknown[]) => runGhGraphqlJson(...args),
}));
vi.mock("./readGhTokenScopes", () => ({
	readGhTokenScopes: () => readGhTokenScopes(),
}));

import {
	parseProjectNumber,
	resolveCreateIssueProject,
} from "./resolveCreateIssueProject";

function projectReply(project: unknown, root = "organization") {
	return (query: string) => {
		const queried = query.includes("organization(login:")
			? "organization"
			: "user";
		return JSON.stringify({
			data: { [queried]: queried === root ? { projectV2: project } : null },
		});
	};
}

beforeEach(() => {
	runGhGraphqlJson.mockReset();
	readGhTokenScopes.mockReset();
	readGhTokenScopes.mockReturnValue(["repo", "project"]);
});

describe("parseProjectNumber", () => {
	it("rejects anything that is not a positive integer", () => {
		expect(() => parseProjectNumber("Roadmap")).toThrow("project number");
		expect(() => parseProjectNumber("0")).toThrow("project number");
		expect(parseProjectNumber("12")).toBe(12);
	});
});

describe("resolveCreateIssueProject", () => {
	const project = {
		id: "PVT_1",
		title: "Roadmap",
		field: {
			id: "F_status",
			options: [
				{ id: "OPT_backlog", name: "Backlog" },
				{ id: "OPT_in_progress", name: "In progress" },
			],
		},
	};

	it("resolves the project and the status option", () => {
		runGhGraphqlJson.mockImplementation(projectReply(project));

		expect(resolveCreateIssueProject("acme", "1", "in progress")).toEqual({
			id: "PVT_1",
			number: 1,
			title: "Roadmap",
			status: {
				fieldId: "F_status",
				optionId: "OPT_in_progress",
				optionName: "In progress",
			},
		});
	});

	it("falls back to a user-owned project", () => {
		runGhGraphqlJson.mockImplementation((query: string) => {
			if (query.includes("organization(login:")) {
				throw new Error("Could not resolve to an Organization with the login");
			}
			return projectReply(project, "user")(query);
		});

		expect(resolveCreateIssueProject("stafford", "1", undefined).id).toBe(
			"PVT_1",
		);
	});

	it("lists the board's options for an unknown status", () => {
		runGhGraphqlJson.mockImplementation(projectReply(project));

		expect(() => resolveCreateIssueProject("acme", "1", "Shipped")).toThrow(
			"Backlog, In progress",
		);
	});

	it("reports a project with no Status field", () => {
		runGhGraphqlJson.mockImplementation(
			projectReply({ id: "PVT_1", title: "Roadmap", field: null }),
		);

		expect(() => resolveCreateIssueProject("acme", "1", "Backlog")).toThrow(
			"no Status single-select field",
		);
	});

	it("refuses to query without the project scope", () => {
		readGhTokenScopes.mockReturnValue(["repo"]);

		expect(() => resolveCreateIssueProject("acme", "1", undefined)).toThrow(
			"gh auth refresh -h github.com -s project",
		);
		expect(runGhGraphqlJson).not.toHaveBeenCalled();
	});
});
