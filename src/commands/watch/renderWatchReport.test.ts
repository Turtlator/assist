import { describe, expect, it } from "vitest";
import type { CommitEntry } from "./CommitEntry";
import { renderWatchReport } from "./renderWatchReport";

const commit = (sha: string, when: string, subject: string): CommitEntry => ({
	sha: sha.padEnd(40, "0"),
	short: sha,
	when,
	subject,
});

const commits = [
	commit("aaa1111", "2 minutes ago", "feat: newest"),
	commit("bbb2222", "1 hour ago", "fix: middle"),
	commit("ccc3333", "3 days ago", "chore: oldest"),
];

describe("renderWatchReport", () => {
	it("leads with the built version", () => {
		const report = renderWatchReport({
			version: "0.488.2",
			commits,
			newShas: [],
			restarts: [],
		});

		expect(report.split("\n")[0]).toBe("**Version** 0.488.2");
	});

	it("renders the commits newest-first as a SHA/When/Subject table", () => {
		const report = renderWatchReport({
			version: "0.488.2",
			commits,
			newShas: [],
			restarts: [],
		});

		expect(report).toContain(
			[
				"| SHA | When | Subject |",
				"| --- | --- | --- |",
				"| `aaa1111` | 2 minutes ago | feat: newest |",
				"| `bbb2222` | 1 hour ago | fix: middle |",
				"| `ccc3333` | 3 days ago | chore: oldest |",
			].join("\n"),
		);
	});

	it("marks only the new commits", () => {
		const report = renderWatchReport({
			version: "0.488.2",
			commits,
			newShas: [commits[0].sha, commits[1].sha],
			restarts: [],
		});

		expect(report).toContain(
			"| `aaa1111` | 2 minutes ago | feat: newest ← new |",
		);
		expect(report).toContain("| `bbb2222` | 1 hour ago | fix: middle ← new |");
		expect(report).toContain("| `ccc3333` | 3 days ago | chore: oldest |");
	});

	it("escapes pipes in a subject so the table survives", () => {
		const report = renderWatchReport({
			version: "0.1.0",
			commits: [commit("ddd4444", "just now", "fix: pipe | in subject")],
			newShas: [],
			restarts: [],
		});

		expect(report).toContain(
			"| `ddd4444` | just now | fix: pipe \\| in subject |",
		);
	});

	it("lists every restart the pull makes necessary", () => {
		const report = renderWatchReport({
			version: "0.488.2",
			commits,
			newShas: [],
			restarts: [
				"restart the web server, then hard-reload the browser tab",
				"restart the daemon",
			],
		});

		expect(report).toContain(
			[
				"**Restarts**",
				"",
				"- restart the web server, then hard-reload the browser tab",
				"- restart the daemon",
			].join("\n"),
		);
	});

	it("says none needed when no restart is required", () => {
		const report = renderWatchReport({
			version: "0.488.2",
			commits,
			newShas: [],
			restarts: [],
		});

		expect(report).toContain("**Restarts**\n\n- none needed");
	});

	it("handles a repository with no commits", () => {
		const report = renderWatchReport({
			version: "0.0.0",
			commits: [],
			newShas: [],
			restarts: [],
		});

		expect(report).toContain("_no commits_");
		expect(report).not.toContain("| SHA |");
	});
});
