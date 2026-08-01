import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import type { PrSummary } from "../prList";
import { ActionButton } from "./ActionButton";
import { reviewButtonModes } from "./reviewButtonModes";
import { ReviewChainToggles } from "./ReviewChainToggles";
import { useReviewLaunch } from "./useReviewLaunch";

export function ReviewButton({
	cwd,
	pr,
	launchedFrom,
}: {
	cwd: string;
	pr: PrSummary;
	launchedFrom?: string;
}) {
	const { chain, setChain, resetChain, launchMode, launchAddressComments } =
		useReviewLaunch(cwd, pr, launchedFrom);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	const pick = (e: { stopPropagation: () => void }, run: () => void) => {
		e.stopPropagation();
		setAnchorEl(null);
		run();
	};

	return (
		<>
			<ActionButton
				label="Review"
				title="Review PR"
				icon={<RateReviewOutlinedIcon sx={{ fontSize: 14 }} />}
				onClick={(e) => {
					e.stopPropagation();
					resetChain();
					setAnchorEl(e.currentTarget);
				}}
			/>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => setAnchorEl(null)}
				onClick={(e) => e.stopPropagation()}
			>
				{reviewButtonModes.map((mode) => (
					<MenuItem
						key={mode.label}
						onClick={(e) => pick(e, () => launchMode(mode.args))}
					>
						{mode.label}
					</MenuItem>
				))}
				<Divider />
				<ReviewChainToggles value={chain} onChange={setChain} />
				<Divider />
				<MenuItem onClick={(e) => pick(e, launchAddressComments)}>
					Address Comments
				</MenuItem>
			</Menu>
		</>
	);
}
