import { Box, List, ListItem, Typography } from "@mui/material";
import type { PlanPhase } from "../types";
import { renderMarkdownInline } from "./renderMarkdown";

export function TaskList({
	tasks,
	marker,
}: {
	tasks: PlanPhase["tasks"];
	marker: string;
}) {
	return (
		<List disablePadding sx={{ ml: 0.5 }}>
			{tasks.map((t) => (
				<ListItem
					key={t.task}
					disableGutters
					disablePadding
					sx={{ py: 0.25, display: "flex", alignItems: "baseline" }}
				>
					<Typography component="span" sx={{ color: "text.secondary", mr: 1 }}>
						{marker}
					</Typography>
					<Box
						component="span"
						className="markdown"
						dangerouslySetInnerHTML={{
							__html: renderMarkdownInline(t.task),
						}}
					/>
				</ListItem>
			))}
		</List>
	);
}
