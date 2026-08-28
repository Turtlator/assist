import { execFileSync } from "node:child_process";

export function runGhIssueCreate(
	title: string,
	body: string,
	repo: string | undefined,
): string {
	const args = ["issue", "create", "--title", title, "--body", body];
	if (repo) args.push("--repo", repo);
	try {
		return execFileSync("gh", args, {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "inherit"],
		});
	} catch {
		process.exit(1);
	}
}
