import { cloneBadgeSessionIds } from "./cloneBadgeSessionIds";
import { flattenSessionGroups } from "./flattenSessionGroups";
import type { groupSessionsByRepo } from "./groupSessionsByRepo";
import { ServingBanners } from "./ServingBanners";
import { SessionGroupItem } from "./SessionGroupItem";
import type { SessionListHandlers } from "./types";
import { CloneBadgeContext } from "./useCloneBadgeContext";

export function SessionGroups({
	groups,
	activeId,
	initialized,
	onSelect,
	onRetry,
	onRestart,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	groups: ReturnType<typeof groupSessionsByRepo>;
	activeId: string | null;
	initialized: Set<string>;
	onSelect: (id: string) => void;
} & SessionListHandlers) {
	const cardProps = {
		activeId,
		initialized,
		onSelect,
		onRetry,
		onRestart,
		onDismiss,
		onSetAutoRun,
		onSetAutoAdvance,
	};
	const allSessions = flattenSessionGroups(groups);
	return (
		<CloneBadgeContext.Provider value={cloneBadgeSessionIds(allSessions)}>
			<ServingBanners sessions={allSessions} onJump={onSelect} />
			{groups.map((group) => (
				<SessionGroupItem
					key={group.kind === "single" ? group.session.id : group.key}
					group={group}
					cardProps={cardProps}
				/>
			))}
		</CloneBadgeContext.Provider>
	);
}
