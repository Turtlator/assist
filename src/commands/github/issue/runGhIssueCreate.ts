import { execFileSync } from "node:child_process";

export function runGhIssueCreate(
	title: string,
	body: string,
	repo: string | undefined,
	labels: string[] | undefined,
): string {
	const args = ["issue", "create", "--title", title, "--body", body];
	if (repo) args.push("--repo", repo);
	for (const label of labels ?? []) args.push("--label", label);
	try {
		return execFileSync("gh", args, {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "inherit"],
		});
	} catch {
		process.exit(1);
	}
}
