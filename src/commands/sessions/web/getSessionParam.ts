import type { IncomingMessage } from "node:http";

export function getSessionParam(req: IncomingMessage): string | undefined {
	const url = new URL(req.url ?? "/", "http://localhost");
	return url.searchParams.get("session") ?? undefined;
}
