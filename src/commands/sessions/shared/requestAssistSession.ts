import { connectToDaemon } from "../daemon/connectToDaemon";
import { readSocketLines } from "../daemon/readSocketLines";

type Incoming =
	| { kind: "created"; sessionId: string }
	| { kind: "error"; message: string };

function parseIncoming(line: string): Incoming | null {
	try {
		const msg = JSON.parse(line) as {
			type?: string;
			sessionId?: string;
			message?: string;
		};
		if (msg.type === "error" && (msg.message ?? "").includes("create-assist"))
			return { kind: "error", message: msg.message ?? "create-assist failed" };
		if (msg.type !== "created" || !msg.sessionId) return null;
		return { kind: "created", sessionId: msg.sessionId };
	} catch {
		return null;
	}
}

export function requestAssistSession(
	assistArgs: string[],
	cwd?: string,
): Promise<string> {
	return new Promise((resolve, reject) => {
		connectToDaemon().then((socket) => {
			let settled = false;
			const finish = (error?: Error, sessionId?: string) => {
				if (settled) return;
				settled = true;
				socket.destroy();
				if (error) reject(error);
				else resolve(sessionId as string);
			};
			readSocketLines(socket, (line) => {
				const incoming = parseIncoming(line);
				if (!incoming) return;
				if (incoming.kind === "error") finish(new Error(incoming.message));
				else finish(undefined, incoming.sessionId);
			});
			socket.on("error", (error) => finish(error));
			socket.on("close", () =>
				finish(new Error("daemon closed before the session was created")),
			);
			socket.write(
				`${JSON.stringify({ type: "create-assist", assistArgs, cwd })}\n`,
			);
		}, reject);
	});
}
