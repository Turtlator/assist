import { Stack, useMediaQuery } from "@mui/material";
import type { Theme } from "@mui/material";
import type { BacklogItem } from "../types";
import { itemNavSections } from "./itemNavSections";
import { ItemNavigatorRow } from "./ItemNavigatorRow";
import { STICKY_PINNED_HEADER_HEIGHT } from "./itemSectionAnchor";

const SIDEBAR_PERCENT = 25;
const ITEM_BODY_MAX_WIDTH = 900;
const APP_BAR_HEIGHT = 48;

const contentCentrePercent = SIDEBAR_PERCENT + (100 - SIDEBAR_PERCENT) / 2;
const gutterLeft = `calc(${contentCentrePercent}% + ${ITEM_BODY_MAX_WIDTH / 2}px)`;

const panelSx = {
	position: "fixed",
	top: APP_BAR_HEIGHT + STICKY_PINNED_HEADER_HEIGHT,
	left: gutterLeft,
	right: 8,
	bottom: 8,
	minWidth: 0,
	alignItems: "flex-start",
	overflowY: "auto",
} as const;

function scrollToSection(id: string) {
	document
		.getElementById(id)
		?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ItemNavigator({ item }: { item: BacklogItem }) {
	const wideEnough = useMediaQuery((theme: Theme) =>
		theme.breakpoints.up("lg"),
	);
	const sections = itemNavSections(item);
	if (!wideEnough || sections.length === 0) return null;
	return (
		<Stack component="nav" spacing={1} sx={panelSx}>
			{sections.map((section) => (
				<ItemNavigatorRow
					key={section.id}
					section={section}
					onSelect={scrollToSection}
				/>
			))}
		</Stack>
	);
}
