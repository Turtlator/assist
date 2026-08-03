import type { HarnessKind } from "./harnesses";
import { resolveHarness } from "./harnessLabel";

export function harnessActivityFields(
	harness: HarnessKind | undefined,
	claudeSessionId: string,
): { harness?: HarnessKind; claudeSessionId?: string } {
	const kind = resolveHarness(harness);
	return kind === "claude" ? { claudeSessionId } : { harness: kind };
}
