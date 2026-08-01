import UndoOutlined from "@mui/icons-material/UndoOutlined";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { ConfirmDialog } from "../../../backlog/web/ui/components/ConfirmDialog";

export function DiffFileRevertButton({
	path,
	added,
	onRevert,
}: {
	path: string;
	added: boolean;
	onRevert: (path: string) => void;
}) {
	const [confirming, setConfirming] = useState(false);

	return (
		<>
			<IconButton
				size="small"
				aria-label="Revert file"
				title="Revert uncommitted changes to this file"
				onClick={(event) => {
					event.stopPropagation();
					setConfirming(true);
				}}
				sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}
			>
				<UndoOutlined sx={{ fontSize: 16 }} />
			</IconButton>
			{confirming && (
				<ConfirmDialog
					title="Revert file"
					message={
						added
							? `This deletes ${path}, which is not in the last commit. This cannot be undone.`
							: `This discards all uncommitted changes to ${path}. This cannot be undone.`
					}
					confirmLabel="Revert"
					onConfirm={() => {
						setConfirming(false);
						onRevert(path);
					}}
					onCancel={() => setConfirming(false)}
				/>
			)}
		</>
	);
}
