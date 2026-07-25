import { OpenPrButton } from "./OpenPrButton";
import { ReviewButton } from "./ReviewButton";
import { reviewTargetPr } from "./reviewTargetPr";
import type { SessionInfo } from "./types";
import { usePrStatus } from "./usePrStatus";

export function CardPrActions({ session }: { session: SessionInfo }) {
	const pr = usePrStatus(session.cwd, reviewTargetPr(session), session.status);
	if (!pr || !session.cwd) return null;
	return (
		<>
			<OpenPrButton pr={pr} />
			<ReviewButton cwd={session.cwd} pr={pr} />
		</>
	);
}
