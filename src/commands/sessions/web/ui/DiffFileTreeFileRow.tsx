import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { DiffFileTreeLineCounts } from "./DiffFileTreeLineCounts";
import {
	DIFF_TREE_CHEVRON_WIDTH,
	diffFileTreeActiveRowSx,
	diffFileTreeNameSx,
	diffFileTreeRowSx,
} from "./diffFileTreeRowSx";
import { FileTypeIcon } from "./FileTypeIcon";

export function DiffFileTreeFileRow({
	name,
	fileKey,
	added,
	removed,
	indent,
	active,
	onSelect,
}: {
	name: string;
	fileKey: string;
	added: number;
	removed: number;
	indent: string;
	active: boolean;
	onSelect: (fileKey: string) => void;
}) {
	return (
		<ButtonBase
			onClick={() => onSelect(fileKey)}
			aria-current={active || undefined}
			sx={{
				...diffFileTreeRowSx,
				...(active ? diffFileTreeActiveRowSx : {}),
				pl: `calc(${indent} + ${DIFF_TREE_CHEVRON_WIDTH}px)`,
			}}
		>
			<FileTypeIcon path={fileKey} />
			<Typography component="span" sx={diffFileTreeNameSx}>
				{name}
			</Typography>
			<DiffFileTreeLineCounts added={added} removed={removed} />
		</ButtonBase>
	);
}
