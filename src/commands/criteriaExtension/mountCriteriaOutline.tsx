import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { createRoot, type Root } from "react-dom/client";
import { containKeyEvents } from "./containKeyEvents";
import { CriteriaOutlineHost } from "./CriteriaOutlineHost";
import { githubColorMode } from "./githubColorMode";

/**
 * Mount the outliner inside a shadow root so GitHub's stylesheet cannot reach
 * MUI's markup and vice versa. Emotion needs its own cache pointed at a node
 * inside the same shadow root, or the generated styles land in the page head
 * where the shadow tree never sees them. The theme inherits the page's font and
 * paints no background of its own, so the control sits on GitHub's own surface,
 * and its palette follows GitHub's colour mode.
 */
export function mountCriteriaOutline(
	host: HTMLElement,
	initialBody: string,
	onBody: (body: string) => void,
): Root {
	const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
	containKeyEvents(host);
	const styles = document.createElement("div");
	const container = document.createElement("div");
	container.style.cssText = "width:100%;font:inherit;color:inherit";
	shadow.append(styles, container);
	const cache = createCache({ key: "assist-criteria", container: styles });
	const theme = createTheme({
		palette: { mode: githubColorMode(document.documentElement) },
		typography: { fontFamily: "inherit" },
	});
	const root = createRoot(container);
	root.render(
		<CacheProvider value={cache}>
			<ThemeProvider theme={theme}>
				<CriteriaOutlineHost initialBody={initialBody} onBody={onBody} />
			</ThemeProvider>
		</CacheProvider>,
	);
	return root;
}
