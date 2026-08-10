import {
	ASSIST_VERSION,
	helloCompatible,
	helloMismatchKind,
	isHello,
	PROTOCOL_VERSION,
} from "./buildHello";
import { daemonLog } from "./daemonLog";
import { windowsVersionCheck } from "./windowsVersionCheck";
import type { WindowsProxyState } from "./WindowsProxyState";

type Msg = Record<string, unknown>;

export function handleHello(state: WindowsProxyState, msg: Msg): void {
	if (!isHello(msg)) return;
	if (helloCompatible(msg)) {
		state.onVersionOk();
		return;
	}
	const mode = windowsVersionCheck();
	const mismatch = `windows daemon ${helloMismatchKind(msg)} mismatch`;
	const detail = `protocol ${msg.protocol ?? "legacy"} version ${msg.version} (wsl protocol ${PROTOCOL_VERSION} version ${ASSIST_VERSION})`;
	if (mode === "off") {
		daemonLog(
			`${mismatch}: ${detail}; check disabled (sessions.windowsVersionCheck=off), proceeding`,
		);
		return;
	}
	if (mode === "warn") {
		daemonLog(
			`${mismatch}: ${detail}; proceeding with warning (sessions.windowsVersionCheck=warn)`,
		);
		return;
	}
	daemonLog(`${mismatch}: ${detail}`);
	state.onVersionMismatch(msg.version);
}
