import { readFileSync } from "node:fs";
import chalk from "chalk";
import { readStdinBuffer } from "../import/readStdinBuffer";
import { type ProposedItem, proposedItemSchema } from "./proposedItemSchema";

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

export async function readProposedItem(source: string): Promise<ProposedItem> {
	const raw = await readSource(source);

	let json: unknown;
	try {
		json = JSON.parse(raw);
	} catch (error) {
		return fail(`The payload is not valid JSON: ${describe(error)}`);
	}

	const parsed = proposedItemSchema.safeParse(json);
	if (!parsed.success) {
		const issues = parsed.error.issues
			.map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`)
			.join("\n");
		return fail(`The payload is not a valid backlog item:\n${issues}`);
	}

	return parsed.data;
}
