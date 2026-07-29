import { Link, Typography } from "@mui/material";
import { TrackerChip } from "./TrackerChip";
import { TrackerToken } from "./TrackerToken";

const sx = { fontSize: "0.875rem" } as const;

export type TrackerLinkVariant = "link" | "chip" | "token";

type TrackerLinkProps = {
	label: string;
	url?: string;
	variant?: TrackerLinkVariant;
};

export function TrackerLink({
	label,
	url,
	variant = "link",
}: TrackerLinkProps) {
	if (variant === "chip") return <TrackerChip label={label} url={url} />;
	if (variant === "token") return <TrackerToken label={label} url={url} />;

	if (!url)
		return (
			<Typography variant="body2" color="text.disabled" sx={sx}>
				{label}
			</Typography>
		);

	return (
		<Link
			href={url}
			target="_blank"
			rel="noopener"
			onClick={(e) => e.stopPropagation()}
			sx={sx}
		>
			{label}
		</Link>
	);
}
