import type * as net from "node:net";
import { createInterface, type Interface } from "node:readline";
import { promptConfirm } from "../../../shared/promptConfirm";
import { clearPersistedSessionsOnDrain } from "./clearPersistedSessionsOnDrain";
import { connectToDaemon } from "./connectToDaemon";
import { readDaemonMessage } from "./readDaemonMessage";

const DRAIN_TIMEOUT_MS = 5_000;
const LIST_TIMEOUT_MS = 2_000;

type LiveSession = { name: string; status: string; cwd?: string };

export async function drainDaemon(
	options: { yes?: boolean } = {},
): Promise<void> {
	let socket: net.Socket;
	try {
		socket = await connectToDaemon();
	} catch {
		clearPersistedSessionsOnDrain();
		return;
	}

	const lines = createInterface({ input: socket });
	lines.on("error", () => {});
	const live = await liveSessions(lines);
	if (live.length > 0 && options.yes !== true) {
		reportLive(live);
		if (!(await confirmDrain())) {
			socket.destroy();
			return;
		}
	}

	const count = await requestDrain(socket, lines);
	socket.destroy();
	console.log(`Drained ${count} session(s)`);
}

function reportLive(live: LiveSession[]): void {
	console.log(`${live.length} live session(s) would be closed:`);
	for (const s of live)
		console.log(`  - ${s.name} [${s.status}]${s.cwd ? ` in ${s.cwd}` : ""}`);
}

async function confirmDrain(): Promise<boolean> {
	if (!process.stdin.isTTY) {
		console.log("Refusing to close live sessions; re-run with --yes");
		process.exitCode = 1;
		return false;
	}
	if (await promptConfirm("Close them all?", false)) return true;
	console.log("Drain cancelled");
	return false;
}

function liveSessions(lines: Interface): Promise<LiveSession[]> {
	return readDaemonMessage(lines, LIST_TIMEOUT_MS, [], (data) =>
		data.type === "sessions"
			? ((data.sessions as LiveSession[]) ?? []).filter(
					(s) => s.status === "running" || s.status === "waiting",
				)
			: undefined,
	);
}

function requestDrain(socket: net.Socket, lines: Interface): Promise<number> {
	socket.write(`${JSON.stringify({ type: "drain" })}\n`);
	// why: the daemon greets the connection with other messages first, so read until the drained ack
	return readDaemonMessage(lines, DRAIN_TIMEOUT_MS, 0, (data) =>
		data.type === "drained" ? ((data.count as number) ?? 0) : undefined,
	);
}
