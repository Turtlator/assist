import type { IncomingMessage } from "node:http";

export async function readRequestBuffer(
	req: IncomingMessage,
	limit: number,
): Promise<Buffer | null> {
	const chunks: Buffer[] = [];
	let size = 0;
	let overLimit = false;
	for await (const chunk of req) {
		const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		size += buf.length;
		if (overLimit) continue;
		if (size > limit) {
			overLimit = true;
			chunks.length = 0;
			continue;
		}
		chunks.push(buf);
	}
	return overLimit ? null : Buffer.concat(chunks);
}
