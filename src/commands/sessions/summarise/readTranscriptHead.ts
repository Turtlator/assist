import * as fs from "node:fs";

export function readTranscriptHead(
	filePath: string,
	maxBytes = 65_536,
): string | undefined {
	try {
		const fd = fs.openSync(filePath, "r");
		try {
			const buf = Buffer.alloc(maxBytes);
			const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
			return buf.toString("utf8", 0, bytesRead);
		} finally {
			fs.closeSync(fd);
		}
	} catch {
		return undefined;
	}
}
