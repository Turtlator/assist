import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import { useState } from "react";
import { canAddAgent } from "./canAddAgent";
import { FreePromptForm } from "./FreePromptForm";
import type { SessionInfo } from "./types";
import { useSessionLaunchContext } from "./useSessionLaunchContext";

export function AddAgentButton({ session }: { session: SessionInfo }) {
	const { launchAgentInStream } = useSessionLaunchContext();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [prompt, setPrompt] = useState("");
	if (!canAddAgent(session)) return null;

	return (
		<>
			<IconButton
				size="small"
				onClick={(e) => {
					e.stopPropagation();
					setAnchorEl(e.currentTarget);
				}}
				title="Add another agent to this session's workspace"
				aria-label="add agent"
				sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
			>
				<GroupAddOutlinedIcon sx={{ fontSize: 14 }} />
			</IconButton>
			<Popover
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => setAnchorEl(null)}
				onClick={(e) => e.stopPropagation()}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<FreePromptForm
					anchored
					value={prompt}
					onChange={setPrompt}
					onSubmit={() => {
						if (!prompt.trim()) return;
						launchAgentInStream(session.id, prompt, session.cwd);
						setPrompt("");
						setAnchorEl(null);
					}}
				/>
			</Popover>
		</>
	);
}
