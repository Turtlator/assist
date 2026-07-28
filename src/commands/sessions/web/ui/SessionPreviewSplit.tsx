import type { ReactNode } from "react";
import type { PrDecisionDetails } from "./PrDecisionDetails";
import { PrPreviewSplit } from "./PrPreviewSplit";
import type { SessionInfo } from "./types";

export type SendPrDecision = (
	sessionId: string,
	requestId: string,
	decision: "approve" | "reject",
	details: PrDecisionDetails,
) => void;

export function SessionPreviewSplit({
	session,
	sendPrDecision,
	children,
}: {
	session: SessionInfo | undefined;
	sendPrDecision: SendPrDecision;
	children: ReactNode;
}) {
	return (
		<PrPreviewSplit
			preview={session?.pendingPrPreview ?? null}
			cwd={session?.cwd}
			onDecision={(requestId, decision, details) => {
				if (session) sendPrDecision(session.id, requestId, decision, details);
			}}
		>
			{children}
		</PrPreviewSplit>
	);
}
