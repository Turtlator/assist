import { homedir } from "node:os";
import { join } from "node:path";

export function commentsCachePath(
	org: string,
	repo: string,
	prNumber: number,
): string {
	return join(
		homedir(),
		".assist",
		"pr-comments",
		org,
		repo,
		`pr-${prNumber}-comments.yaml`,
	);
}
