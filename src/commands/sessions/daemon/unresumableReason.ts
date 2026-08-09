import { harnessLabel, resolveHarness } from "../../../shared/harnessLabel";
import { harnessResumesConversation } from "../../../shared/harnessResumesConversation";
import type { PersistedSession } from "./loadPersistedSessions";

export function unresumableReason(
	harness: PersistedSession["harness"],
): string {
	if (resolveHarness(harness) === "claude")
		return "no claude session id was recorded before the daemon stopped, so the conversation cannot be resumed";
	return harnessResumesConversation(harness)
		? `no ${harnessLabel(harness)} conversation id was recorded before the daemon stopped, so the conversation cannot be resumed`
		: `${harnessLabel(harness)} sessions cannot be resumed yet, so the conversation cannot be restored`;
}
