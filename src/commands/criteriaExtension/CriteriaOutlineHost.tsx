import { Box } from "@mui/material";
import { useState } from "react";
import { acceptanceCriteriaState } from "../sessions/web/ui/acceptanceCriteriaState";
import { acceptanceSectionSlice } from "../sessions/web/ui/acceptanceSectionSlice";
import { CriteriaContextField } from "./CriteriaContextField";
import { CriteriaInsertPrompt } from "./CriteriaInsertPrompt";
import { CriteriaSectionControl } from "./CriteriaSectionControl";

const BEFORE_LABEL = "Body before acceptance criteria";
const AFTER_LABEL = "Body after acceptance criteria";

export function CriteriaOutlineHost({
	initialBody,
	onBody,
}: {
	initialBody: string;
	onBody: (body: string) => void;
}) {
	const [body, setBody] = useState(initialBody);
	const state = acceptanceCriteriaState(body);
	const slice = acceptanceSectionSlice(body);

	const update = (next: string) => {
		setBody(next);
		onBody(next);
	};

	if (state.kind === "insert" || !slice)
		return <CriteriaInsertPrompt body={body} onBody={update} />;

	const items = state.kind === "outline" ? state.items : null;
	const before = items ? slice.before : [...slice.before, ...slice.lines];
	const untouched = items ? slice.lines : [];

	return (
		<Box sx={{ width: "100%" }}>
			<CriteriaContextField
				label={BEFORE_LABEL}
				value={before.join("\n")}
				onChange={(text) =>
					update([...text.split("\n"), ...untouched, ...slice.after].join("\n"))
				}
			/>
			<CriteriaSectionControl items={items} body={body} onBody={update} />
			<CriteriaContextField
				label={AFTER_LABEL}
				value={slice.after.join("\n")}
				onChange={(text) =>
					update([...before, ...untouched, ...text.split("\n")].join("\n"))
				}
			/>
		</Box>
	);
}
