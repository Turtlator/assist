import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router";
import { diffQuery } from "./diffQuery";

const containerSx = {
	display: "flex",
	alignItems: "center",
	gap: 0.75,
	fontFamily: "monospace",
	whiteSpace: "nowrap",
} as const;

export type StatusGroup = {
	key: string;
	prefix: string;
	color: string;
	count: number;
};

function GitStatusChips({ groups }: { groups: StatusGroup[] }) {
	return groups.map((g) => (
		<Box key={g.key} component="span" sx={{ color: g.color }}>
			{g.prefix}
			{g.count}
		</Box>
	));
}

export function CountsLink({
	cwd,
	sessionId,
	scope,
	groups,
	bracketed,
}: {
	cwd: string;
	sessionId?: string;
	scope: string;
	groups: StatusGroup[];
	bracketed?: boolean;
}) {
	return (
		<Link
			component={RouterLink}
			to={`/diff?${diffQuery(cwd, sessionId, scope)}`}
			variant="caption"
			underline="hover"
			color="inherit"
			sx={containerSx}
		>
			{bracketed && <Box component="span">(</Box>}
			<GitStatusChips groups={groups} />
			{bracketed && <Box component="span">)</Box>}
		</Link>
	);
}
