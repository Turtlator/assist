import { Box, ListItemButton, Typography } from "@mui/material";
import type { ScopedRule } from "../../../rules/types";

const listSx = { maxHeight: 132, overflow: "auto" } as const;

const rowSx = {
	gap: 1,
	alignItems: "baseline",
	borderRadius: 1,
	py: 0.25,
	px: 0.75,
} as const;

const textSx = {
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export function RuleCitationList({
	rules,
	onCite,
}: {
	rules: ScopedRule[];
	onCite: (rule: ScopedRule) => void;
}) {
	return (
		<Box>
			<Typography variant="caption" color="text.secondary">
				Cite a broken rule
			</Typography>
			<Box sx={listSx}>
				{rules.map((rule) => (
					<ListItemButton
						key={`${rule.source}:${rule.code}`}
						dense
						sx={rowSx}
						title={`${rule.text} (${rule.source})`}
						onClick={() => onCite(rule)}
					>
						<Typography
							variant="caption"
							color="primary"
							sx={{ fontWeight: "bold" }}
						>
							{rule.code}
						</Typography>
						<Typography variant="caption" sx={textSx}>
							{rule.text}
						</Typography>
					</ListItemButton>
				))}
			</Box>
		</Box>
	);
}
