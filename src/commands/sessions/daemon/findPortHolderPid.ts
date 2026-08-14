import { execFileSync } from "node:child_process";

const PROBE_TIMEOUT_MS = 3_000;

export function findPortHolderPid(port: number): number | undefined {
	try {
		return process.platform === "win32"
			? netstatListenerPid(probe("netstat", ["-ano"]), port)
			: firstPid(probe("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"]));
	} catch {
		return undefined;
	}
}

function probe(command: string, args: string[]): string {
	return execFileSync(command, args, {
		encoding: "utf8",
		timeout: PROBE_TIMEOUT_MS,
		stdio: ["ignore", "pipe", "ignore"],
	});
}

function netstatListenerPid(output: string, port: number): number | undefined {
	const suffix = `:${port}`;
	for (const line of output.split("\n")) {
		const [protocol, local, , state, pid] = line.trim().split(/\s+/);
		if (protocol?.toUpperCase() !== "TCP") continue;
		if (state?.toUpperCase() !== "LISTENING") continue;
		if (!local?.endsWith(suffix)) continue;
		const holder = Number.parseInt(pid ?? "", 10);
		if (Number.isInteger(holder)) return holder;
	}
	return undefined;
}

function firstPid(output: string): number | undefined {
	for (const line of output.split("\n")) {
		const pid = Number.parseInt(line.trim(), 10);
		if (Number.isInteger(pid)) return pid;
	}
	return undefined;
}
