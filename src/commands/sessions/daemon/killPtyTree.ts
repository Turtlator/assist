import type { Session } from "./createSession";

export function killPtyTree(pty: NonNullable<Session["pty"]>): void {
	if (process.platform === "win32") {
		pty.kill();
		return;
	}
	try {
		process.kill(-pty.pid, "SIGHUP");
	} catch {
		try {
			pty.kill();
		} catch {}
	}
}
