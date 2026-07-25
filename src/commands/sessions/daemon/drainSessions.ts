import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { dismissSessionGated } from "./dismissSessionGated";

export function drainSessions(
	sessions: Map<string, Session>,
	notify: () => void,
): number {
	const drained = [...sessions.values()].map((s) => ({
		id: s.id,
		name: s.name,
	}));
	for (const { id } of drained) dismissSessionGated(sessions, id, notify);
	notify();
	daemonLog(
		drained.length > 0
			? `drained ${drained.length} session(s): ${drained.map((s) => s.name).join(", ")}`
			: "drained 0 sessions",
	);
	const gated = [...sessions.values()];
	if (gated.length > 0)
		daemonLog(
			`${gated.length} drained session(s) closing under the durability gate: ${gated
				.map((s) => s.name)
				.join(", ")} — any holding unpushed work stay as stopped cards`,
		);
	return drained.length;
}
