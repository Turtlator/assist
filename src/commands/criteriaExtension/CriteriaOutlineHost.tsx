import { Box } from "@mui/material";
import { useState } from "react";
import { acceptanceSectionSlice } from "../sessions/web/ui/acceptanceSectionSlice";
import { AcceptanceCriteriaOutline } from "../sessions/web/ui/AcceptanceCriteriaOutline";
import { splitAcceptanceCriteria } from "../sessions/web/ui/splitAcceptanceCriteria";
import { writeAcceptanceCriteria } from "../sessions/web/ui/writeAcceptanceCriteria";
import { CriteriaContextField } from "./CriteriaContextField";

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
	const section = splitAcceptanceCriteria(body);
	const slice = acceptanceSectionSlice(body);

	const update = (next: string) => {
		setBody(next);
		onBody(next);
	};

	if (!section || !slice) return null;

	// why: the section's own lines are carried through verbatim, so editing the
	// prose around it never rewrites criterion markers the user did not touch
	return (
		<Box sx={{ width: "100%" }}>
			<CriteriaContextField
				label={BEFORE_LABEL}
				value={section.before.join("\n")}
				onChange={(text) =>
					update(
						[...text.split("\n"), ...slice.lines, ...section.after].join("\n"),
					)
				}
			/>
			<AcceptanceCriteriaOutline
				items={section.items}
				onChange={(items) => update(writeAcceptanceCriteria(body, items))}
			/>
			<CriteriaContextField
				label={AFTER_LABEL}
				value={section.after.join("\n")}
				onChange={(text) =>
					update(
						[...section.before, ...slice.lines, ...text.split("\n")].join("\n"),
					)
				}
			/>
		</Box>
	);
}
