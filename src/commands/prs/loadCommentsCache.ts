import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { parse } from "yaml";
import { commentsCachePath } from "./commentsCachePath";
import type { PrComment } from "./types";

type CacheData = {
	prNumber: number;
	fetchedAt: string;
	comments: PrComment[];
};

export function loadCommentsCache(
	org: string,
	repo: string,
	prNumber: number,
): CacheData | null {
	const cachePath = commentsCachePath(org, repo, prNumber);
	if (!existsSync(cachePath)) {
		return null;
	}
	const content = readFileSync(cachePath, "utf8");
	return parse(content) as CacheData;
}

export function deleteCommentsCache(
	org: string,
	repo: string,
	prNumber: number,
): void {
	const cachePath = commentsCachePath(org, repo, prNumber);
	if (existsSync(cachePath)) {
		unlinkSync(cachePath);
		console.log("No more unresolved line comments. Cache dropped.");
	}
}
