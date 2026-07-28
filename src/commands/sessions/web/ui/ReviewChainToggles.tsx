import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";

export type ReviewChain = { addressComments: boolean; announce: boolean };

export const reviewChainDefaults: ReviewChain = {
	addressComments: false,
	announce: false,
};

export function reviewChainArgs(chain: ReviewChain): string[] {
	return [
		...(chain.addressComments ? ["--address-comments"] : []),
		...(chain.announce ? ["--announce"] : []),
	];
}

const labelSx = { "& .MuiFormControlLabel-label": { fontSize: 12 } } as const;

export function ReviewChainToggles({
	value,
	onChange,
}: {
	value: ReviewChain;
	onChange: (chain: ReviewChain) => void;
}) {
	return (
		<FormGroup sx={{ px: 2, py: 0.5 }}>
			<FormControlLabel
				control={
					<Checkbox
						size="small"
						checked={value.addressComments}
						onChange={(e) =>
							onChange({ ...value, addressComments: e.target.checked })
						}
					/>
				}
				label="Address comments after"
				sx={labelSx}
			/>
			<FormControlLabel
				control={
					<Checkbox
						size="small"
						checked={value.announce}
						onChange={(e) => onChange({ ...value, announce: e.target.checked })}
					/>
				}
				label="Announce to Slack after"
				sx={labelSx}
			/>
		</FormGroup>
	);
}
