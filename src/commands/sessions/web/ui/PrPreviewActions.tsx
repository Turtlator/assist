import { Button, Stack } from "@mui/material";
import type { PrPreviewChain } from "./PrPreviewChain";
import { PrPreviewChainToggles } from "./PrPreviewChainToggles";

export function PrPreviewActions({
	commentCount,
	chain,
	onChainChange,
	onApprove,
	onReject,
	onRequestChanges,
}: {
	commentCount: number;
	chain?: PrPreviewChain;
	onChainChange: (chain: PrPreviewChain) => void;
	onApprove: () => void;
	onReject: () => void;
	onRequestChanges: () => void;
}) {
	return (
		<Stack
			direction="row"
			spacing={1}
			sx={{ p: 2, alignItems: "center", justifyContent: "flex-end" }}
		>
			{chain && (
				<PrPreviewChainToggles chain={chain} onChange={onChainChange} />
			)}
			<Button color="error" variant="outlined" onClick={onReject}>
				Reject
			</Button>
			{commentCount > 0 && (
				<Button color="warning" variant="contained" onClick={onRequestChanges}>
					Request changes ({commentCount})
				</Button>
			)}
			<Button color="success" variant="contained" onClick={onApprove}>
				Approve
			</Button>
		</Stack>
	);
}
