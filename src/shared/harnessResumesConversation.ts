import type { HarnessKind } from "./harnesses";
import { resolveHarness } from "./harnessLabel";

const RESUMES_CONVERSATION: Record<HarnessKind, boolean> = {
	claude: true,
	codex: false,
	pi: false,
};

export function harnessResumesConversation(
	harness: HarnessKind | undefined,
): boolean {
	return RESUMES_CONVERSATION[resolveHarness(harness)];
}
