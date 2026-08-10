import type { PreviewDecision } from "./PreviewDecision";
import { type DecisionMessage, toPreviewDecision } from "./toPreviewDecision";

type Incoming =
	| { kind: "decision"; decision: PreviewDecision }
	| { kind: "error"; message: string };

export function parsePreviewDecision(
	line: string,
	requestId: string,
): Incoming | null {
	try {
		const msg = JSON.parse(line) as DecisionMessage;
		if (msg.type === "error" && (msg.message ?? "").includes("pr-preview"))
			return { kind: "error", message: msg.message ?? "pr-preview failed" };
		if (msg.type !== "pr-decision" || msg.requestId !== requestId) return null;
		const decision = toPreviewDecision(msg);
		return decision ? { kind: "decision", decision } : null;
	} catch {
		return null;
	}
}
