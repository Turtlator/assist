import { DiffCommentSnackbar } from "./DiffCommentSnackbar";
import { DiffRevertSnackbar } from "./DiffRevertSnackbar";

export function DiffSnackbars({
	sentTo,
	clearSent,
	revertError,
	clearRevertError,
}: {
	sentTo: string | null;
	clearSent: () => void;
	revertError: string | null;
	clearRevertError: () => void;
}) {
	return (
		<>
			<DiffCommentSnackbar sessionName={sentTo} onClose={clearSent} />
			<DiffRevertSnackbar error={revertError} onClose={clearRevertError} />
		</>
	);
}
