import type { Socket } from "node:net";
import { connectToDaemon } from "./daemon/connectToDaemon";

export function signalVerifying(): () => void {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (!sessionId) return () => {};

	let socket: Socket | undefined;
	let released = false;

	connectToDaemon().then((connected) => {
		if (released) return connected.destroy();
		socket = connected;
		connected.on("error", () => {});
		connected.unref();
		connected.write(
			`${JSON.stringify({ type: "verify-started", sessionId })}\n`,
		);
	}, ignoreUnreachableDaemon);

	return () => {
		released = true;
		socket?.destroy();
	};
}

function ignoreUnreachableDaemon(): void {}
