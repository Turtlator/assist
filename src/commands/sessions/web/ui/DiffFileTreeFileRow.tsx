import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { DiffFileTreeLineCounts } from "./DiffFileTreeLineCounts";
import {
	DIFF_TREE_CHEVRON_WIDTH,
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
	onSelect,
}: {
	name: string;
	fileKey: string;
	added: number;
	removed: number;
	indent: string;
	onSelect: (fileKey: string) => void;
}) {
	return (
		<ButtonBase
			onClick={() => onSelect(fileKey)}
			sx={{
				...diffFileTreeRowSx,
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
