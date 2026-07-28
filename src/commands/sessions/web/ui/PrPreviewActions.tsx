import { Box, Button, Checkbox, FormControlLabel, Stack } from "@mui/material";

export function PrPreviewActions({
	commentCount,
	reviewAfter,
	onReviewAfterChange,
	onApprove,
	onReject,
	onRequestChanges,
}: {
	commentCount: number;
	reviewAfter?: boolean;
	onReviewAfterChange: (reviewAfter: boolean) => void;
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
			{reviewAfter !== undefined && (
				<Box sx={{ mr: "auto" }}>
					<FormControlLabel
						control={
							<Checkbox
								size="small"
								checked={reviewAfter}
								onChange={(e) => onReviewAfterChange(e.target.checked)}
							/>
						}
						label="Review + Post after raising"
						sx={{ "& .MuiFormControlLabel-label": { fontSize: 12 } }}
					/>
				</Box>
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
