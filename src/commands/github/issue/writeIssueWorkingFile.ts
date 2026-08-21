import { mkdirSync, writeFileSync } from "node:fs";
import { issueWorkingFile } from "./issueWorkingFile";

export function writeIssueWorkingFile(
	slug: string,
	number: number,
	target: string,
	updatedAt: string,
	body: string,
): string {
	const { dir, bodyPath, metaPath } = issueWorkingFile(slug, number);
	mkdirSync(dir, { recursive: true });
	writeFileSync(bodyPath, body);
	writeFileSync(
		metaPath,
		`${JSON.stringify({ target, updatedAt }, null, 2)}\n`,
	);
	return bodyPath;
}
