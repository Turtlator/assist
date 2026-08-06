import { spawnSync } from "node:child_process";

export function replyToComment(
	org: string,
	repo: string,
	prNumber: number,
	commentId: number,
	message: string,
): void {
	const result = spawnSync(
		"gh",
		[
			"api",
			`repos/${org}/${repo}/pulls/${prNumber}/comments`,
			"-f",
			`body=${message}`,
			"-F",
			`in_reply_to=${commentId}`,
		],
		{ encoding: "utf8", windowsHide: true },
	);
	if (result.error) throw result.error;
	if (result.status !== 0) throw new Error(result.stderr || result.stdout);
}
