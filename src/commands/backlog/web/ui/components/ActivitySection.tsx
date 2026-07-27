import { Box, Link, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { groupActivityRefs } from "../../../groupActivityRefs";
import type { GitRef } from "../types";
import { itemSectionAnchor } from "./itemSectionAnchor";
import { RefRow } from "./RefRow";

const headingSx = {
	color: "text.secondary",
	mb: 1,
	display: "block",
	letterSpacing: "0.08em",
} as const;

const toggleSx = {
	color: "text.secondary",
	alignSelf: "flex-start",
	textAlign: "left",
} as const;

export function ActivitySection({ gitRefs }: { gitRefs: GitRef[] }) {
	const [expanded, setExpanded] = useState(false);
	const { branches, commits, overflowCommits, prs, slacks } =
		groupActivityRefs(gitRefs);
	const ordered = [
		...branches,
		...commits,
		...(expanded ? overflowCommits : []),
		...prs,
		...slacks,
	];
	if (ordered.length === 0) return null;
	return (
		<Box {...itemSectionAnchor("activity")}>
			<Typography variant="overline" sx={headingSx}>
				Activity
			</Typography>
			<Stack spacing={1}>
				{ordered.map((r) => (
					<RefRow key={`${r.kind}:${r.ref}`} gitRef={r} />
				))}
				{overflowCommits.length > 0 && (
					<Link
						component="button"
						type="button"
						variant="body2"
						underline="hover"
						sx={toggleSx}
						onClick={(e) => {
							e.stopPropagation();
							setExpanded((prev) => !prev);
						}}
					>
						{expanded
							? "Show fewer commits"
							: `… and ${overflowCommits.length} more commits`}
					</Link>
				)}
			</Stack>
		</Box>
	);
}
