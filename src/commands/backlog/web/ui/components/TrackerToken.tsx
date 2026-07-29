import Link from "@mui/material/Link";

const tokenSx = {
	color: "primary.main",
	opacity: 0.85,
	whiteSpace: "nowrap",
} as const;

export function TrackerToken({ label, url }: { label: string; url?: string }) {
	if (!url) return label;

	return (
		<Link
			href={url}
			target="_blank"
			rel="noopener"
			underline="hover"
			sx={tokenSx}
			onMouseDown={(e) => e.stopPropagation()}
			onClick={(e) => e.stopPropagation()}
		>
			{label}
		</Link>
	);
}
