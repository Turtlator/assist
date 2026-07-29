import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import type { PrPreviewChain } from "./PrPreviewChain";

const labelSx = { "& .MuiFormControlLabel-label": { fontSize: 12 } } as const;

export function PrPreviewChainToggles({
	chain,
	onChange,
}: {
	chain: PrPreviewChain;
	onChange: (chain: PrPreviewChain) => void;
}) {
	return (
		<Stack direction="row" sx={{ mr: "auto" }}>
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
