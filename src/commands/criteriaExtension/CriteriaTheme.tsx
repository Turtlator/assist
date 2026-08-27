import { createTheme, ThemeProvider } from "@mui/material";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { githubColorMode } from "./githubColorMode";
import { watchGithubColorMode } from "./watchGithubColorMode";

export function CriteriaTheme({ children }: { children: ReactNode }) {
	const [mode, setMode] = useState(() =>
		githubColorMode(document.documentElement),
	);

	useEffect(() => watchGithubColorMode(document.documentElement, setMode), []);

	const theme = useMemo(
		() =>
			createTheme({
				palette: { mode },
				typography: { fontFamily: "inherit" },
			}),
		[mode],
	);

	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
