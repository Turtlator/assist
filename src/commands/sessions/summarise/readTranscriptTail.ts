import * as fs from "node:fs";

export function readTranscriptTail(
	filePath: string,
	maxBytes = 65_536,
): string | undefined {
	let fd: number | undefined;
	try {
		const { size } = fs.statSync(filePath);
		const start = Math.max(0, size - maxBytes);
		fd = fs.openSync(filePath, "r");
		const buf = Buffer.alloc(size - start);
		const bytesRead = fs.readSync(fd, buf, 0, buf.length, start);
		return buf.toString("utf8", 0, bytesRead);
	} catch {
		return undefined;
	} finally {
		if (fd !== undefined) fs.closeSync(fd);
	}
}
