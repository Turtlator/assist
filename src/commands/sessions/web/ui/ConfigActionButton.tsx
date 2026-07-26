import IconButton from "@mui/material/IconButton";
import type { ReactNode } from "react";

type Props = {
	label: string;
	disabled: boolean;
	icon: ReactNode;
	onClick?: () => void;
};

export function ConfigActionButton({ label, disabled, icon, onClick }: Props) {
	if (!onClick) return null;
	return (
		<IconButton
			size="small"
			aria-label={label}
			disabled={disabled}
			onClick={onClick}
		>
			{icon}
		</IconButton>
	);
}
