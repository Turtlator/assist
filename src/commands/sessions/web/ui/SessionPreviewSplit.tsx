import type { ReactNode } from "react";
import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import { PrPreviewSplit } from "./PrPreviewSplit";
import type { SessionInfo } from "./types";

export type SendPrDecision = (
	sessionId: string,
	requestId: string,
	decision: "approve" | "reject",
	reason?: string,
	comments?: PrPreviewComment[],
	screenshots?: string[],
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
			onDecision={(requestId, decision, comments, screenshots) => {
				if (session)
					sendPrDecision(
						session.id,
						requestId,
						decision,
						undefined,
						comments,
						screenshots,
					);
			}}
		>
			{children}
		</PrPreviewSplit>
	);
}
