import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router";
import { StopCardActivation } from "./StopCardActivation";

const containerSx = {
	display: "flex",
	alignItems: "center",
	gap: 0.75,
	fontFamily: "monospace",
} as const;

type StatusGroup = {
	key: string;
	label: string;
	prefix: string;
	color: string;
	count: number;
};

export const GROUPS = [
	{ key: "new", label: "New", prefix: "+", color: "success.main" },
	{ key: "modified", label: "Modified", prefix: "~", color: "warning.main" },
	{ key: "deleted", label: "Deleted", prefix: "-", color: "error.main" },
] as const;

function GitStatusChips({ groups }: { groups: StatusGroup[] }) {
	return groups.map((g) => (
		<Box key={g.key} component="span" sx={{ color: g.color }}>
			{g.prefix}
			{g.count}
		</Box>
	));
}

export function GitStatusLink({
	cwd,
	groups,
}: {
	cwd: string;
	groups: StatusGroup[];
}) {
	return (
		<StopCardActivation>
			<Link
				component={RouterLink}
				to={`/diff?cwd=${encodeURIComponent(cwd)}`}
				variant="caption"
				underline="hover"
				color="inherit"
				sx={containerSx}
			>
				<GitStatusChips groups={groups} />
			</Link>
		</StopCardActivation>
	);
}
