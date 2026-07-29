import type { ReactElement } from "react";
import { ConfigListInput } from "./ConfigListInput";
import type { ConfigNodeEditorProps } from "./ConfigNodeEditorRenderer";
import { ConfigObjectEditor } from "./ConfigObjectEditor";
import { ConfigObjectListEditor } from "./ConfigObjectListEditor";
import { ConfigRecordEditor } from "./ConfigRecordEditor";
import { ConfigScalarEditor } from "./ConfigScalarEditor";
import { ConfigScalarText } from "./ConfigScalarText";
import { ConfigSecretInput } from "./ConfigSecretInput";
import { ConfigVariantEditor } from "./ConfigVariantEditor";

export function ConfigNodeEditor(props: ConfigNodeEditorProps): ReactElement {
	const { node, label, value, disabled, onChange } = props;
	if (node.secret) return <ConfigSecretInput {...props} />;
	switch (node.kind) {
		case "scalar":
			return <ConfigScalarEditor {...props} node={node} />;
		case "scalarList":
			return (
				<ConfigListInput
					label={label}
					value={value}
					disabled={disabled}
					onChange={onChange}
				/>
			);
		case "object":
			return (
				<ConfigObjectEditor
					{...props}
					fields={node.fields}
					render={ConfigNodeEditor}
				/>
			);
		case "unionOfObjects":
			return (
				<ConfigVariantEditor {...props} node={node} render={ConfigNodeEditor} />
			);
		case "objectList":
			return (
				<ConfigObjectListEditor
					{...props}
					node={node}
					render={ConfigNodeEditor}
				/>
			);
		case "record":
			return (
				<ConfigRecordEditor {...props} node={node} render={ConfigNodeEditor} />
			);
		default:
			return <ConfigScalarText value={value} />;
	}
}
