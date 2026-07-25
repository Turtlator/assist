import type { z } from "zod";
import { describeConfigLeaves } from "./describeConfigLeaves";

export function enumerateConfigLeafKeys(schema: z.ZodTypeAny): string[] {
	return describeConfigLeaves(schema).map((leaf) => leaf.key);
}
