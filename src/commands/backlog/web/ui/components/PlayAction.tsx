import { type MouseEvent, useState } from "react";
import { useNavigate } from "react-router";
import { useLiveSessionsContext } from "../../../../sessions/web/ui/useLiveSessionsContext";
import { useSessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { formatItemId } from "../../../formatItemId";
import { useRepoCwd } from "../useRepoCwd";
import { PlayButton } from "./PlayButton";
import { runInFlightSession } from "./runInFlightSession";

export function PlayAction({
	itemId,
	compact = false,
}: {
	itemId: number;
	compact?: boolean;
}) {
	const { launchAssist } = useSessionLaunchContext();
	const navigate = useNavigate();
	const cwd = useRepoCwd();
	const inFlight = runInFlightSession(useLiveSessionsContext(), itemId);
	// Latch on first click so a double-click can't spawn two sessions before
	// the list refresh flips the item out of the playable state.
	const [launched, setLaunched] = useState(false);
	const disabled = launched || inFlight !== undefined;
	const handleClick = (event: MouseEvent) => {
		event.stopPropagation();
		if (disabled) return;
		setLaunched(true);
		launchAssist(["backlog", "run", formatItemId(itemId)], cwd);
		navigate("/sessions");
	};
	return (
		<PlayButton
			tooltip={
				inFlight
					? "Already running — close that session to run it again"
					: "Build"
			}
			disabled={disabled}
			compact={compact}
			onClick={handleClick}
		/>
	);
}
