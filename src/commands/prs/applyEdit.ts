import { execFileSync } from "node:child_process";

export function applyEdit(
	number: number,
	title: string | undefined,
	body: string,
): void {
	const args = ["pr", "edit", String(number)];
	if (title) args.push("--title", title);
	args.push("--body", body);

	try {
		execFileSync("gh", args, { stdio: "inherit" });
	} catch {
		process.exit(1);
	}
}
