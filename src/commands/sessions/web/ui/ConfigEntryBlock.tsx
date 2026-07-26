import Box from "@mui/material/Box";
import type { ReactNode } from "react";

export function ConfigEntryBlock({ children }: { children: ReactNode }) {
	return (
		<Box
			sx={{
				flex: 1,
				minWidth: 0,
				borderLeft: 2,
				borderColor: "divider",
				pl: 1,
			}}
		>
			{children}
		</Box>
	);
}
