import { z } from "zod";

const proposedPhaseSchema = z.strictObject({
	name: z.string().trim().min(1, "phase name is required"),
	tasks: z
		.array(z.string().trim().min(1))
		.min(1, "a phase needs at least one task"),
	manualChecks: z.array(z.string().trim().min(1)).default([]),
});

export const proposedItemSchema = z.strictObject({
	name: z.string().trim().min(1, "name is required"),
	type: z.enum(["story", "bug"]),
	description: z.string().optional(),
	acceptanceCriteria: z.array(z.string().trim().min(1)).default([]),
	phases: z.array(proposedPhaseSchema).default([]),
});

export type ProposedItem = z.infer<typeof proposedItemSchema>;
