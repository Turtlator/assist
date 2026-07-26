import { readFileSync } from "node:fs";
import chalk from "chalk";
import type { z } from "zod";
import { readStdinBuffer } from "./import/readStdinBuffer";

function fail(message: string): never {
	console.error(chalk.red(message));
	process.exit(1);
}

function describe(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

async function readSource(source: string): Promise<string> {
	try {
		if (source === "-") return (await readStdinBuffer()).toString("utf8");
		return readFileSync(source, "utf8");
	} catch (error) {
		return fail(
			`Cannot read the payload from ${source === "-" ? "stdin" : source}: ${describe(error)}`,
		);
	}
}

export async function readJsonPayload<Schema extends z.ZodTypeAny>(
	source: string,
	schema: Schema,
	subject: string,
): Promise<z.infer<Schema>> {
	const raw = await readSource(source);

	let json: unknown;
	try {
		json = JSON.parse(raw);
	} catch (error) {
		return fail(`The payload is not valid JSON: ${describe(error)}`);
	}

	const parsed = schema.safeParse(json);
	if (!parsed.success) {
		const issues = parsed.error.issues
			.map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`)
			.join("\n");
		return fail(`The payload is not a valid ${subject}:\n${issues}`);
	}

	return parsed.data;
}
