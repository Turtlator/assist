import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import type { PrPreviewChain } from "./PrPreviewChain";

const labelSx = { "& .MuiFormControlLabel-label": { fontSize: 12 } } as const;

export function PrPreviewChainToggles({
	chain,
	newPr,
	onChange,
}: {
	chain: PrPreviewChain;
	newPr: boolean;
	onChange: (chain: PrPreviewChain) => void;
}) {
	return (
		<Stack direction="row" sx={{ mr: "auto" }}>
			{newPr && (
				<FormControlLabel
					control={
						<Checkbox
							size="small"
							checked={chain.draft}
							onChange={(e) => onChange({ ...chain, draft: e.target.checked })}
						/>
					}
					label="Draft"
					title="Create the PR as a draft rather than ready for review"
					sx={labelSx}
				/>
			)}
			<FormControlLabel
				control={
					<Checkbox
						size="small"
						checked={chain.reviewAfter}
						onChange={(e) =>
							onChange({ ...chain, reviewAfter: e.target.checked })
						}
					/>
				}
				label="Review"
				title="After raising, run a review that posts its findings and then addresses them"
				sx={labelSx}
			/>
			<FormControlLabel
				control={
					<Checkbox
						size="small"
						checked={chain.announceAfter}
						onChange={(e) =>
							onChange({ ...chain, announceAfter: e.target.checked })
						}
					/>
				}
				label="Post"
				title="Announce the PR in Slack at the tail of the chain"
				sx={labelSx}
			/>
		</Stack>
	);
}
