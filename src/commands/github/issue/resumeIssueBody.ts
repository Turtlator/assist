import { existsSync, readFileSync } from "node:fs";
import { issueWorkingFile } from "./issueWorkingFile";

export function resumeIssueBody(
	slug: string,
	number: number,
	updatedAt: string,
): string | undefined {
	const { bodyPath, metaPath } = issueWorkingFile(slug, number);
	if (!existsSync(bodyPath) || !existsSync(metaPath)) return undefined;

	try {
		const meta = JSON.parse(readFileSync(metaPath, "utf8")) as {
			updatedAt?: unknown;
		};
		if (meta.updatedAt !== updatedAt) return undefined;
		return readFileSync(bodyPath, "utf8");
	} catch {
		return undefined;
	}
}
