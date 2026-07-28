import { z } from "zod";
import { activitySchema } from "../../../shared/emitActivity";

export const persistedSessionSchema = z.object({
	id: z.string().optional(),
	name: z.string(),
	title: z.string().optional(),
	generatedTitle: z.string().optional(),
	subtitle: z.string().optional(),
	commandType: z.enum(["claude", "run", "assist"]),
	harness: z.enum(["claude", "codex", "pi"]).optional(),
	status: z.enum(["running", "waiting", "done", "error", "stopped"]).optional(),
	cwd: z.string(),
	startedAt: z.number(),
	runningMs: z.number().optional(),
	claudeSessionId: z.string().optional(),
	initialPrompt: z.string().optional(),
	runName: z.string().optional(),
	runArgs: z.array(z.string()).optional(),
	assistArgs: z.array(z.string()).optional(),
	activity: activitySchema.optional(),
	starred: z.boolean().optional(),
	undurable: z
		.object({ reason: z.string(), removesTree: z.boolean().optional() })
		.optional(),
});

export type PersistedSession = z.infer<typeof persistedSessionSchema>;
