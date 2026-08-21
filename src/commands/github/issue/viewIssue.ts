import { execFileSync } from "node:child_process";

export function viewIssue(number: number, repo: string | undefined): void {
	const args = ["issue", "view", String(number)];
	if (repo) args.push("--repo", repo);

	try {
		execFileSync("gh", args, { stdio: "inherit" });
	} catch {
		process.exit(1);
	}
}
