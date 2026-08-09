import { resolveHarness } from "../../../shared/harnessLabel";
import { harnessResumesConversation } from "../../../shared/harnessResumesConversation";
import { codexRespawnPlan } from "./codexRespawnPlan";
import type { Session } from "./createSession";
import {
	interactiveRespawnPlan,
	type RespawnPlan,
} from "./interactiveRespawnPlan";

export function interactiveHarnessRespawn(
	session: Session,
): RespawnPlan | null {
	if (resolveHarness(session.harness) === "codex")
		return codexRespawnPlan(session);
	return interactiveRespawnPlan(
		session,
		harnessResumesConversation(session.harness),
	);
}
