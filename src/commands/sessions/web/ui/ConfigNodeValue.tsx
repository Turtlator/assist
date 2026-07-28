import type { ReactElement } from "react";
import type { ConfigNode } from "../../../../shared/ConfigNode";
import { ConfigListValue } from "./ConfigListValue";
import { ConfigObjectFields } from "./ConfigObjectFields";
import { ConfigRecordValue } from "./ConfigRecordValue";
import { ConfigScalarText } from "./ConfigScalarText";
import { EmptyConfigValue } from "./EmptyConfigValue";
import { pickObjectVariant } from "./pickObjectVariant";

type Props = {
	node: ConfigNode;
	value: unknown;
};

export function ConfigNodeValue({ node, value }: Props): ReactElement {
	if (node.secret) return <EmptyConfigValue text="set (hidden)" />;
	switch (node.kind) {
		case "object":
			return (
				<ConfigObjectFields
					fields={node.fields}
					value={value}
					render={ConfigNodeValue}
				/>
			);
		case "unionOfObjects": {
			const variant = pickObjectVariant(node.variants, value);
			if (!variant) return <ConfigScalarText value={value} />;
			return (
				<ConfigObjectFields
					fields={variant.fields}
					value={value}
					render={ConfigNodeValue}
				/>
			);
		}
		case "scalarList":
		case "objectList":
			return (
				<ConfigListValue node={node} value={value} render={ConfigNodeValue} />
			);
		case "record":
			return (
				<ConfigRecordValue node={node} value={value} render={ConfigNodeValue} />
			);
		default:
			return <ConfigScalarText value={value} />;
	}
}
