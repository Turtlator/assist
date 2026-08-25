import { Box } from "@mui/material";
import { CriteriaSectionButton } from "../sessions/web/ui/CriteriaSectionButton";
import { insertAcceptanceCriteria } from "../sessions/web/ui/insertAcceptanceCriteria";
import { CriteriaContextField } from "./CriteriaContextField";

const BODY_LABEL = "Issue body";

export function CriteriaInsertPrompt({
	body,
	onBody,
}: {
	body: string;
	onBody: (body: string) => void;
}) {
	return (
		<Box sx={{ width: "100%" }}>
			<CriteriaContextField label={BODY_LABEL} value={body} onChange={onBody} />
			<CriteriaSectionButton
				kind="insert"
				onClick={() => onBody(insertAcceptanceCriteria(body))}
			/>
		</Box>
	);
}
