import { Box } from "@mui/material";
import { criterionNumbers } from "./criterionNumbers";
import { CriterionRow } from "./CriterionRow";
import type { AcceptanceCriterion } from "./splitAcceptanceCriteria";

const outlineSx = {
	my: 1,
	px: 1,
	py: 0.5,
	border: 1,
	borderColor: "divider",
	borderRadius: 1,
	userSelect: "text",
	cursor: "auto",
} as const;

export function AcceptanceCriteriaOutline({
	items,
	onChange,
}: {
	items: AcceptanceCriterion[];
	onChange: (items: AcceptanceCriterion[]) => void;
}) {
	const numbers = criterionNumbers(items.map((item) => item.depth));

	return (
		<Box sx={outlineSx} data-preview-skip aria-label="Acceptance criteria">
			{items.map((item, index) => (
				<CriterionRow
					key={`criterion-${index}`}
					number={numbers[index]}
					depth={item.depth}
					text={item.text}
					onText={(text) =>
						onChange(
							items.map((current, i) =>
								i === index ? { ...current, text } : current,
							),
						)
					}
				/>
			))}
		</Box>
	);
}
