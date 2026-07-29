import Chip from "@mui/material/Chip";

const chipSx = { height: 18, fontSize: "0.65rem" } as const;

export function TrackerChip({ label, url }: { label: string; url?: string }) {
	if (!url)
		return (
			<Chip
				label={label}
				size="small"
				sx={chipSx}
				clickable={false}
				onClick={(e) => e.stopPropagation()}
			/>
		);

	return (
		<Chip
			label={label}
			size="small"
			sx={chipSx}
			clickable
			component="a"
			href={url}
			target="_blank"
			rel="noopener"
			onClick={(e) => e.stopPropagation()}
		/>
	);
}
