import type { RestartTarget } from "./postRestart";
import { RestartConfirmDialog } from "./RestartConfirmDialog";
import { UpdateAssistConfirmDialog } from "./UpdateAssistConfirmDialog";
import { useSessionLaunchContext } from "./useSessionLaunchContext";

type HamburgerMenuDialogsProps = {
	restartTarget: RestartTarget | null;
	onCloseRestart: () => void;
	updating: boolean;
	onCloseUpdate: () => void;
};

export function HamburgerMenuDialogs({
	restartTarget,
	onCloseRestart,
	updating,
	onCloseUpdate,
}: HamburgerMenuDialogsProps) {
	const { launchAssist, armUpdateReload } = useSessionLaunchContext();

	return (
		<>
			{restartTarget && (
				<RestartConfirmDialog target={restartTarget} onClose={onCloseRestart} />
			)}
			{updating && (
				<UpdateAssistConfirmDialog
					onConfirm={() => {
						armUpdateReload();
						launchAssist(["update"]);
					}}
					onClose={onCloseUpdate}
				/>
			)}
		</>
	);
}
