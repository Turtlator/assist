import Menu from "@mui/material/Menu";
import { useState } from "react";
import { useNavigate } from "react-router";
import { hamburgerMenuItems } from "./hamburgerMenuItems";
import { HamburgerMenuDialogs } from "./HamburgerMenuDialogs";
import { MenuTriggerButton } from "./MenuTriggerButton";
import type { RestartTarget } from "./postRestart";

export function HamburgerMenu({
	mode,
	toggle,
}: {
	mode: "light" | "dark";
	toggle: () => void;
}) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [pending, setPending] = useState<RestartTarget | null>(null);
	const [updatePending, setUpdatePending] = useState(false);
	const navigate = useNavigate();
	const open = Boolean(anchorEl);
	const close = () => setAnchorEl(null);

	return (
		<>
			<MenuTriggerButton open={open} onOpen={setAnchorEl} />
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={close}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
			>
				{hamburgerMenuItems({
					mode,
					onToggleColorMode: () => {
						toggle();
						close();
					},
					onConfig: () => {
						close();
						navigate("/config");
					},
					onRestart: (target) => {
						close();
						setPending(target);
					},
					onUpdate: () => {
						close();
						setUpdatePending(true);
					},
				})}
			</Menu>
			<HamburgerMenuDialogs
				restartTarget={pending}
				onCloseRestart={() => setPending(null)}
				updating={updatePending}
				onCloseUpdate={() => setUpdatePending(false)}
			/>
		</>
	);
}
