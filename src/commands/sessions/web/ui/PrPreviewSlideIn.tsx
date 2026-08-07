import Box from "@mui/material/Box";
import type { TransitionEvent } from "react";
import type { PrPreview } from "../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "./PrDecisionDetails";
import { PrPreviewPane } from "./PrPreviewPane";
import { slideInSx } from "./slideInSx";

export function PrPreviewSlideIn({
	rendered,
	sessionId,
	cwd,
	open,
	onExited,
	onDecision,
}: {
	rendered: PrPreview | null;
	sessionId?: string;
	cwd?: string;
	open: boolean;
	onExited: () => void;
	onDecision: (
		requestId: string,
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
}) {
	const handleTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
		if (!open && e.propertyName === "transform" && e.target === e.currentTarget)
			onExited();
	};

	return (
		<Box
			aria-hidden={!open}
			onTransitionEnd={handleTransitionEnd}
			sx={slideInSx(open)}
		>
			{rendered && (
				<PrPreviewPane
					key={rendered.requestId}
					preview={rendered}
					sessionId={sessionId}
					cwd={cwd}
					onDecision={(decision, details) =>
						onDecision(rendered.requestId, decision, details)
					}
				/>
			)}
		</Box>
	);
}
