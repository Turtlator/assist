import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	MenuItem,
	MenuList,
} from "@mui/material";
import { useState } from "react";
import type { PrSummary } from "../prList";
import { reviewButtonModes } from "./reviewButtonModes";
import {
	reviewChainArgs,
	reviewChainDefaults,
	ReviewChainToggles,
} from "./ReviewChainToggles";

export function ReviewTypeDialog({
	pr,
	onSelect,
	onCancel,
}: {
	pr: PrSummary;
	onSelect: (args: string[]) => void;
	onCancel: () => void;
}) {
	const [chain, setChain] = useState(reviewChainDefaults);

	return (
		<Dialog open onClose={onCancel} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ fontSize: 15 }}>
				Review #{pr.number}: {pr.title}
			</DialogTitle>
			<DialogContent sx={{ px: 0 }}>
				<MenuList>
					{reviewButtonModes.map(({ label, args }) => (
						<MenuItem
							key={label}
							onClick={() => onSelect([...args, ...reviewChainArgs(chain)])}
						>
							{label}
						</MenuItem>
					))}
					<Divider />
					<ReviewChainToggles value={chain} onChange={setChain} />
					<Divider />
					<MenuItem onClick={() => onSelect(["review-pr-comments"])}>
						Address Comments
					</MenuItem>
				</MenuList>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>Cancel</Button>
			</DialogActions>
		</Dialog>
	);
}
