import ChevronRight from "@mui/icons-material/ChevronRight";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { diffFileTreeNameSx, diffFileTreeRowSx } from "./diffFileTreeRowSx";

export function DiffFileTreeDirRow({
	name,
	collapsed,
	indent,
	onToggle,
}: {
	name: string;
	collapsed: boolean;
	indent: string;
	onToggle: () => void;
}) {
	return (
		<ButtonBase
			onClick={onToggle}
			aria-expanded={!collapsed}
			sx={{ ...diffFileTreeRowSx, pl: indent }}
		>
			{collapsed ? (
				<ChevronRight fontSize="small" />
			) : (
				<ExpandMore fontSize="small" />
			)}
			<Typography
				component="span"
				color="text.secondary"
				sx={diffFileTreeNameSx}
			>
				{name}
			</Typography>
		</ButtonBase>
	);
}
