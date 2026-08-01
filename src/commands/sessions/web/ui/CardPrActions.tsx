import Box from "@mui/material/Box";
import { OpenPrButton } from "./OpenPrButton";
import { ReviewButton } from "./ReviewButton";
import { reviewTargetPr } from "./reviewTargetPr";
import type { SessionInfo } from "./types";
import { usePrStatus } from "./usePrStatus";
import { useTopBarLayoutContext } from "./useTopBarLayoutContext";
import { ViewReviewButton } from "./ViewReviewButton";

const stackedSx = {
	display: "inline-flex",
	flexDirection: "column",
	alignItems: "stretch",
	flexShrink: 0,
	"&:empty": { display: "none" },
	"& > *": {
		justifyContent: "flex-start",
		minHeight: 0,
		py: 0.125,
	},
} as const;

const inlineSx = {
	display: "flex",
	flexDirection: "row",
	alignItems: "center",
	flexShrink: 0,
	gap: 1,
	"&:empty": { display: "none" },
} as const;

export function CardPrActions({ session }: { session: SessionInfo }) {
	const pr = usePrStatus(session.cwd, reviewTargetPr(session), session.status);
	const topBar = useTopBarLayoutContext();
	const cwd = session.cwd;

	return (
		<>
			{pr && cwd && <OpenPrButton pr={pr} />}
			<Box sx={topBar ? stackedSx : inlineSx}>
				{pr && cwd && (
					<ReviewButton cwd={cwd} pr={pr} launchedFrom={session.id} />
				)}
				<ViewReviewButton session={session} />
			</Box>
		</>
	);
}
