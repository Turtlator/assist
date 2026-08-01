import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";
import { SessionStatusGlyph } from "./SessionStatusGlyph";
import { statusColors } from "./statusColors";

const spin = keyframes`
	to { transform: rotate(360deg); }
`;

const railSx = {
	gridColumn: 1,
	gridRow: 1,
	justifySelf: "center",
	alignSelf: "center",
	position: "relative",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	width: "14px",
	height: "20px",
	color: statusColors.running,
} as const;

const ringSx = {
	position: "absolute",
	width: "14px",
	height: "14px",
	borderRadius: "50%",
	border: "1.5px solid",
	borderColor: "currentColor",
	borderTopColor: "transparent",
	opacity: 0.45,
	animation: `${spin} 1.1s linear infinite`,
	"@media (prefers-reduced-motion: reduce)": {
		animation: "none",
		borderTopColor: "currentColor",
	},
} as const;

export function SessionVerifyRing() {
	return (
		<Box sx={railSx}>
			<Box sx={ringSx} />
			<SessionStatusGlyph status="running" title="verifying" />
		</Box>
	);
}
