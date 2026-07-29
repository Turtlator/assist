import { CardDataLine } from "./CardDataLine";
import { CardExtraLines } from "./CardExtraLines";
import { CardMetaLine } from "./CardMetaLine";
import type { SessionInfo } from "./types";
import { useTopBarLayoutContext } from "./useTopBarLayoutContext";

export function CardBody({
	session,
	loading,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	session: SessionInfo;
	loading: boolean;
	onSetAutoRun: (enabled: boolean) => void;
	onSetAutoAdvance: (enabled: boolean) => void;
}) {
	const topBar = useTopBarLayoutContext();

	if (loading) return null;

	return (
		<>
			<CardMetaLine session={session} />
			<CardDataLine session={session} />
			{!topBar && (
				<CardExtraLines
					session={session}
					onSetAutoRun={onSetAutoRun}
					onSetAutoAdvance={onSetAutoAdvance}
				/>
			)}
		</>
	);
}
