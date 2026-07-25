import { z } from "zod";

export const proposedItemSchema = z.strictObject({
	name: z.string().trim().min(1, "name is required"),
	type: z.enum(["story", "bug"]),
	description: z.string().optional(),
	acceptanceCriteria: z.array(z.string().trim().min(1)).default([]),
});

export type ProposedItem = z.infer<typeof proposedItemSchema>;
