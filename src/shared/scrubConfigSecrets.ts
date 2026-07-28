import type { ConfigNode } from "./ConfigNode";
import { mapConfigSecrets } from "./mapConfigSecrets";
import { SECRET_MASK } from "./maskConfigSecrets";

function secretStrings(value: unknown, node: ConfigNode | undefined): string[] {
	const secrets: string[] = [];
	mapConfigSecrets(value, node, (secret) => {
		if (typeof secret === "string" && secret !== "") secrets.push(secret);
		return secret;
	});
	return secrets;
}

function literalAndJsonEncoded(secret: string): string[] {
	const encoded = JSON.stringify(secret).slice(1, -1);
	return encoded === secret ? [secret] : [secret, encoded];
}

export function scrubConfigSecrets(
	messages: string[],
	value: unknown,
	node: ConfigNode | undefined,
): string[] {
	const needles = secretStrings(value, node)
		.flatMap(literalAndJsonEncoded)
		.sort((a, b) => b.length - a.length);
	if (needles.length === 0) return messages;
	return messages.map((message) =>
		needles.reduce(
			(text, needle) => text.split(needle).join(SECRET_MASK),
			message,
		),
	);
}
