import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { ConfirmDialog } from "../../../backlog/web/ui/components/ConfirmDialog";
import { StopCardActivation } from "./StopCardActivation";
import { useServerActionsContext } from "./useServerActionsContext";

export function DiscardButton({ id, reason }: { id: string; reason?: string }) {
	const { onDiscard } = useServerActionsContext();
	const [confirming, setConfirming] = useState(false);

	return (
		<>
			<IconButton
				size="small"
				onClick={(e) => {
					e.stopPropagation();
					setConfirming(true);
				}}
				title="Discard changes and remove worktree"
				sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}
			>
				<DeleteForeverIcon sx={{ fontSize: 16 }} />
			</IconButton>
			{confirming && (
				<StopCardActivation>
					<ConfirmDialog
						title="Discard all changes"
						message={`This permanently deletes the worktree and its uncommitted work${reason ? ` (${reason})` : ""}. This cannot be undone.`}
						confirmLabel="Discard changes"
						onConfirm={() => {
							setConfirming(false);
							onDiscard(id);
						}}
						onCancel={() => setConfirming(false)}
					/>
				</StopCardActivation>
			)}
		</>
	);
}
