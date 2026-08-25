import { InputBase } from "@mui/material";
import { criterionTextSx } from "../sessions/web/ui/criterionRowSx";

const fieldSx = { ...criterionTextSx, flex: "none", width: "100%" } as const;

/** An editable slab of the body markdown either side of the criteria section. */
export function CriteriaContextField({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (text: string) => void;
}) {
	return (
		<InputBase
			multiline
			fullWidth
			value={value}
			sx={fieldSx}
			inputProps={{ "aria-label": label }}
			onChange={(event) => onChange(event.target.value)}
		/>
	);
}
