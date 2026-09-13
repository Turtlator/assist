export const proposeHelpText = `The payload is strict JSON: { name, type, description?, acceptanceCriteria?, phases? }.
Each phase is { name, tasks, manualChecks? } and needs at least one task.

The Review phase is owned by the runner and appended to every plan automatically,
so it must not be authored: a phase named "Review" is rejected. Do not add a final
phase for verifying acceptance criteria, confirming manual checks, committing or
marking the item done — that is what the appended Review phase does.`;
