import { CardBadges } from "./CardBadges";
import { CardTokens } from "./CardTokens";
import type { SessionInfo } from "./types";

export function CardChips({ session }: { session: SessionInfo }) {
	return (
		<>
			<CardTokens session={session} />
			<CardBadges session={session} />
		</>
	);
}
