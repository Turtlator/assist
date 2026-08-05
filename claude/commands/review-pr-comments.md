---
description: Process PR review comments one by one
---

Process review comments for the current branch's pull request.

## Fetching Comments

Fetch all review comments using `assist prs list-comments`. The output is already grouped and filtered — read it directly, and do not parse the YAML cache:

- **Review comments** print first, in full.
- **Unresolved threads** print next, one block per thread, each headed `Thread on <path>:<line>` and listing every comment in the thread with its author, `id` and `html_url`, followed by the body. These are the threads to process.
- **Resolved threads** print below as a one-line-per-thread index, for reference only — do not process them.
- The closing summary reports the unresolved and resolved thread counts.

Comments are also cached to `~/.assist/pr-comments/{org}/{repo}/pr-{prNumber}-comments.yaml` for use by the reply and resolve commands.

## Processing Comments

**Threads:** each unresolved thread block is one unit of work — never merge different threads, even when they are on the same file. Within a block, present follow-up comments (e.g., a reviewer endorsing a bot suggestion) as context alongside the primary actionable comment. Only call `fixed`/`wontfix` once per thread, using the `id` of the primary actionable comment.

Create a task for each unresolved **thread** (not each comment). For each thread:

1. **Display the comment** to the user:
   - Show the reviewer, file/line (if applicable), and the comment text
   - Show the relevant code context (diff hunk or read the file)

2. **Analyze the comment** and determine your recommendation:
   - Read the relevant source file if needed for context
   - Consider whether the feedback is valid, applicable, and improves the code
   - Prepare a recommended fix if you believe the comment should be addressed

3. **Present options to the user** using AskUserQuestion:
   - Include the comment URL (from `html_url` field) so the user can view it on GitHub
   - **Address the comment**: Display your recommended fix and explain why it addresses the feedback
   - **Do not address**: Display your reasoning for why the comment should not be addressed (e.g., already handled, out of scope, incorrect suggestion)
   - **Skip**: Move on to the next comment without taking any action

4. **Act on the user's choice**:
   - If addressing:
     1. Implement the fix
     2. Run `/commit` to commit changes - parse the 7-char SHA from the output line "Committed: <sha>"
     3. Run `assist prs fixed <comment-id> <sha>` to reply with commit link and resolve the thread
   - If not addressing:
     1. Write a **1-sentence** summary of why, max 15 words (must not contain "claude" or "opus")
     2. Run `assist prs wontfix <comment-id> "<reason>"` to reply and resolve the thread
   - If skipping:
     1. Do nothing — move on to the next comment immediately
   - **Commit references**: Always use full markdown links (e.g., `[abc1234](https://github.com/owner/repo/commit/abc1234)`), never bare SHAs

5. **Repeat** until all comments have been processed

## Announcing when done

If `$ARGUMENTS` contains `--announce <number>`, then once every thread has been processed (addressed, wontfixed, or skipped) run `/prs-slack <number> --no-confirm` exactly once to announce the PR in Slack. Do this only at the very end, and only once, no matter how many threads there were. Without `--announce`, never announce.

## Important

- Process comments one at a time to avoid overwhelming the user
- Always show the comment content before asking for a decision
- Provide clear, actionable recommendations
- If a comment is unclear, note this in your analysis
- Reply messages must not contain "claude" or "opus" (case-insensitive) - the command will reject them
- When referencing previous comments, use markdown link syntax: `[previous comment](url)`
- Use backticks to wrap inline code or keywords (e.g., `functionName`, `variable`)
