import Box from "@mui/material/Box";
import type { groupSessionsByRepo } from "./groupSessionsByRepo";
import type { NestedSessionRow } from "./nestUnderBacklogRun";
import { SessionGroupSection } from "./SessionGroupSection";
import { SessionListCard } from "./SessionListCard";
import type { SessionListHandlers } from "./types";
import type { SessionInfo } from "./useSessionSocket";

type SessionCardProps = {
	activeId: string | null;
	initialized: Set<string>;
	onSelect: (id: string) => void;
} & SessionListHandlers;

const nestedChildrenSx = {
	ml: 2,
	pl: 1,
	borderLeft: 2,
	borderColor: "divider",
} as const;

export function SessionGroupItem({
	group,
	cardProps,
}: {
	group: ReturnType<typeof groupSessionsByRepo>[number];
	cardProps: SessionCardProps;
}) {
	const renderCard = (session: SessionInfo) => (
		<SessionListCard key={session.id} session={session} {...cardProps} />
	);
	const renderRow = (row: NestedSessionRow) =>
		row.children.length === 0 ? (
			renderCard(row.session)
		) : (
			<Box key={row.session.id}>
				{renderCard(row.session)}
				<Box sx={nestedChildrenSx}>{row.children.map(renderCard)}</Box>
			</Box>
		);
	return group.kind === "single" ? (
		renderCard(group.session)
	) : (
		<SessionGroupSection label={group.label}>
			{group.rows.map(renderRow)}
		</SessionGroupSection>
	);
}
