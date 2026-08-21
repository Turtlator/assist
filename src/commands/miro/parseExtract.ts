import { type MiroExtractConfig, miroExtractSchema } from "../../shared/types";
import { MiroExtractError } from "./MiroExtractError";

export function parseExtract(name: string, value: unknown): MiroExtractConfig {
	const parsed = miroExtractSchema.safeParse(value);
	if (parsed.success) return parsed.data;
	const issues = parsed.error.issues
		.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
		.join("; ");
	throw new MiroExtractError(`Extract "${name}" is not valid: ${issues}`);
}
