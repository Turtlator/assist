import { spawn } from "node:child_process";
import { isWindowsDaemonRunning } from "./connectToWindowsDaemon";
import { daemonLog } from "./daemonLog";
import { logChildStream } from "./logChildStream";
import { windowsBridgeFailureCause } from "./windowsBridgeFailureCause";

// node-for-windows plus a cold daemon start is slower than the WSL daemon
const SPAWN_TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 300;

type WindowsDaemonLaunch = { failureCause: () => string | null };

export async function ensureWindowsDaemonRunning(): Promise<void> {
	if (await isWindowsDaemonRunning()) {
		daemonLog("windows daemon: already running");
		return;
	}
	daemonLog("windows daemon: not running, launching via pwsh.exe");
	await waitForWindowsDaemon(launchWindowsDaemon());
}

// why: pwsh 7 (not powershell.exe 5.1) loads the profile that runs `fnm env`, putting the fnm-managed node and global `assist` shim on PATH; without the profile neither resolves
function launchWindowsDaemon(): WindowsDaemonLaunch {
	/* why: pipe (not stdio:"ignore") so a host that can't start the daemon — a
	 * broken install or a failed self-update — lands its stdout/stderr and exit
	 * code in daemon.log instead of failing silently */
	const child = spawn("pwsh.exe", ["-Command", "assist daemon run"], {
		detached: true,
		stdio: ["ignore", "pipe", "pipe"],
	});
	let cause: string | null = null;
	const watchForFailure = (line: string): void => {
		cause ??= windowsBridgeFailureCause(line);
	};
	logChildStream(child.stdout, "windows daemon run", watchForFailure);
	logChildStream(child.stderr, "windows daemon run", watchForFailure);
	child.on("error", (e) => {
		daemonLog(`failed to launch windows daemon: ${e.message}`);
		cause ??= `could not launch pwsh.exe: ${e.message}`;
	});
	child.on("exit", (code) => {
		if (code !== 0)
			daemonLog(`windows daemon launch exited early with code ${code}`);
	});
	child.unref();
	return { failureCause: () => cause };
}

async function waitForWindowsDaemon(
	launch: WindowsDaemonLaunch,
): Promise<void> {
	const start = Date.now();
	const deadline = start + SPAWN_TIMEOUT_MS;
	let attempts = 0;
	while (Date.now() < deadline) {
		await delay(RETRY_DELAY_MS);
		attempts++;
		if (await isWindowsDaemonRunning()) {
			daemonLog(
				`windows daemon: up after ${Date.now() - start}ms (${attempts} attempts)`,
			);
			return;
		}
		const cause = launch.failureCause();
		if (cause) {
			daemonLog(
				`windows daemon: launch failed after ${attempts} attempts: ${cause}`,
			);
			throw new Error(`Windows daemon failed to start: ${cause}`);
		}
	}
	daemonLog(
		`windows daemon: did NOT start within ${SPAWN_TIMEOUT_MS}ms (${attempts} attempts)`,
	);
	throw new Error(
		"Windows daemon did not start; is assist installed on the Windows host?",
	);
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
