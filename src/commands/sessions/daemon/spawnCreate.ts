import type { HarnessKind } from "../../../shared/harnesses";
import { daemonLog } from "./daemonLog";
import type { SessionManager } from "./SessionManager";

export function spawnCreate(
	m: SessionManager,
	d: Record<string, unknown>,
): string {
	const design = d.design === true;
	const harness = d.harness as HarnessKind | undefined;
	const prompt = d.prompt as string | undefined;
	if (design)
		daemonLog(`create: design session (cwd=${(d.cwd as string) ?? ""})`);
	if (harness && harness !== "claude")
		daemonLog(`create: ${harness} session (cwd=${(d.cwd as string) ?? ""})`);
	const joinSessionId = design
		? undefined
		: (d.joinSessionId as string | undefined);
	if (joinSessionId) {
		const joined = m.addAgent(joinSessionId, prompt, harness);
		if (joined) return joined;
		daemonLog(
			`create: falling back to a fresh isolated session (cwd=${(d.cwd as string) ?? ""})`,
		);
	}
	return m.spawn(prompt, d.cwd as string | undefined, design, harness);
}
