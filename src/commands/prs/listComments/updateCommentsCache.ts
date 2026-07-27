import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { stringify } from "yaml";
import { commentsCachePath } from "../commentsCachePath";
import { deleteCommentsCache } from "../loadCommentsCache";
import type { PrComment } from "../types";

function writeCommentsCache(
	org: string,
	repo: string,
	prNumber: number,
	comments: PrComment[],
): void {
	const cachePath = commentsCachePath(org, repo, prNumber);
	mkdirSync(dirname(cachePath), { recursive: true });

	const cacheData = {
		prNumber,
		fetchedAt: new Date().toISOString(),
		comments,
	};

	writeFileSync(cachePath, stringify(cacheData));
}

export function updateCommentsCache(
	org: string,
	repo: string,
	prNumber: number,
	comments: PrComment[],
): void {
	if (comments.some((c) => c.type === "line")) {
		writeCommentsCache(org, repo, prNumber, comments);
	} else {
		deleteCommentsCache(org, repo, prNumber);
	}
}
