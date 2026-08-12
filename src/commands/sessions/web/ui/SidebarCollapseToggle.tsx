import ViewSidebarOutlined from "@mui/icons-material/ViewSidebarOutlined";
import IconButton from "@mui/material/IconButton";

export function SidebarCollapseToggle({
	collapsed,
	onToggleCollapsed,
}: {
	collapsed: boolean;
	onToggleCollapsed: () => void;
}) {
	const label = collapsed ? "Show sidebar" : "Hide sidebar";

	return (
		<IconButton
			onClick={onToggleCollapsed}
			title={label}
			aria-label={label}
			aria-pressed={!collapsed}
			sx={{
				color: collapsed ? "text.disabled" : "text.primary",
				"&:hover": { color: "text.primary" },
			}}
		>
			<ViewSidebarOutlined />
		</IconButton>
	);
}
