import { Box, Link, Typography } from "@mui/material";
import type { GitRef } from "../types";
import { CommitTimestamp } from "./CommitTimestamp";
import { refLabel } from "../../../refLabel";

const kindSx = {
	color: "text.secondary",
	mr: 1,
	fontFamily: "monospace",
} as const;

function RefText({ gitRef }: { gitRef: GitRef }) {
	const label = refLabel(gitRef);
	if (!gitRef.url) return <>{label}</>;
	return (
		<Link
			href={gitRef.url}
			target="_blank"
			rel="noopener"
			onClick={(e) => e.stopPropagation()}
		>
			{label}
		</Link>
	);
}

export function RefRow({ gitRef }: { gitRef: GitRef }) {
	return (
		<Typography variant="body2">
			<Box component="span" sx={kindSx}>
				{gitRef.kind}
			</Box>
			<RefText gitRef={gitRef} />
			<CommitTimestamp gitRef={gitRef} />
		</Typography>
	);
}
