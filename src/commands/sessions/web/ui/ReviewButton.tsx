import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import type { PrSummary } from "../prList";
import { ActionButton } from "./ActionButton";
import { prLaunchMeta } from "./prLaunchMeta";
import { reviewButtonModes } from "./reviewButtonModes";
import { useSessionLaunchContext } from "./useSessionLaunchContext";

export function ReviewButton({ cwd, pr }: { cwd: string; pr: PrSummary }) {
	const { launchAssist } = useSessionLaunchContext();
	const meta = { ...prLaunchMeta(pr), inPlace: true };
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	return (
		<>
			<ActionButton
				label="Review"
				title="Review PR"
				icon={<RateReviewOutlinedIcon sx={{ fontSize: 14 }} />}
				onClick={(e) => {
					e.stopPropagation();
					setAnchorEl(e.currentTarget);
				}}
			/>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={() => setAnchorEl(null)}
				onClick={(e) => e.stopPropagation()}
			>
				{reviewButtonModes.map((mode) => (
					<MenuItem
						key={mode.label}
						onClick={(e) => {
							e.stopPropagation();
							setAnchorEl(null);
							launchAssist([...mode.args, String(pr.number)], cwd, meta);
						}}
					>
						{mode.label}
					</MenuItem>
				))}
				<Divider />
				<MenuItem
					onClick={(e) => {
						e.stopPropagation();
						setAnchorEl(null);
						launchAssist(["review-pr-comments", String(pr.number)], cwd, meta);
					}}
				>
					Address Comments
				</MenuItem>
			</Menu>
		</>
	);
}
