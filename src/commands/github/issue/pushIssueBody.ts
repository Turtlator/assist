import { execFileSync } from "node:child_process";

export function pushIssueBody(
	number: number,
	repo: string | undefined,
	bodyPath: string,
): void {
	const args = ["issue", "edit", String(number), "--body-file", bodyPath];
	if (repo) args.push("--repo", repo);

	try {
		execFileSync("gh", args, { stdio: "inherit" });
	} catch {
		process.exit(1);
	}
}
