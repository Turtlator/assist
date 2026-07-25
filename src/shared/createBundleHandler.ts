import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Handler } from "./web";

export function createBundleHandler(
	importMetaUrl: string,
	bundlePath: string,
	contentType = "application/javascript",
): Handler {
	const file = join(dirname(fileURLToPath(importMetaUrl)), bundlePath);
	let cache: { body: string; etag: string; mtimeMs: number } | undefined;
	return (req, res) => {
		const mtimeMs = statSync(file).mtimeMs;
		if (cache?.mtimeMs !== mtimeMs) {
			const body = readFileSync(file, "utf8");
			const etag = `"${createHash("sha256").update(body).digest("hex").slice(0, 16)}"`;
			cache = { body, etag, mtimeMs };
		}
		// why: fixed /bundle.js URL means an upgraded CLI would otherwise serve the browser's cached old bundle; revalidate so newer UI appears
		const headers = {
			ETag: cache.etag,
			"Cache-Control": "no-cache",
		};
		if (req.headers["if-none-match"] === cache.etag) {
			res.writeHead(304, headers);
			res.end();
			return;
		}
		res.writeHead(200, {
			"Content-Type": contentType,
			...headers,
		});
		res.end(cache.body);
	};
}
