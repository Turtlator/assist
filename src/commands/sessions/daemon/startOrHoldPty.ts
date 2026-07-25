import type { Session } from "./types";

export function startOrHoldPty(
	start: () => Session["pty"],
	hold: boolean | undefined,
): Pick<Session, "pty" | "pendingStart"> {
	if (hold) return { pty: null, pendingStart: start };
	return { pty: start() };
}
