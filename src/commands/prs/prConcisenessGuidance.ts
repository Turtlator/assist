export const prConcisenessGuidance = `Brevity budget — one paragraph per section, and these are ceilings, not targets:

  ## What  2–3 sentences.
  ## Why   1–2 sentences.
  ## How   omit by default; a sentence or two, only for non-obvious decisions.

The budget is a total, not a per-paragraph allowance. Splitting a section across
two paragraphs buys no extra room. The whole body should read in well under a
minute — roughly 6 sentences and 900 characters of prose for a typical change,
counting every section together. A body that is long-winded overall is wrong even
when each paragraph is individually short.

Terse technical register. Write like a commit message, not a report. Short
declarative sentences, one clause each: state the fact and stop. Cut
scene-setting, restatements of the heading, "this change …", "in order to", "it
is worth noting", hedges ("essentially", "fairly", "somewhat"), and adverbs that
carry no information. Present tense, active voice. If a sentence can lose half
its words and still say the same thing, it is too long.

  Wordy: This change introduces a new validation step so that the command is
         able to reject pull request bodies which exceed the configured limit.
  Terse: Rejects bodies over the limit.

Sentence count is a floor on brevity, not the whole of it — a body inside the
budget can still be too verbose, and then it needs cutting rather than reflowing.
Prefer deleting a sentence to shortening it.

Write prose. A short paragraph is the natural form for ## What and ## Why —
bullets in ## What are a smell. Use bullets only when there are genuinely several
independent, parallel items (3+); a single bullet is never right. A single
non-list paragraph over ~600 characters or ~4 sentences is a wall of text and
will be rejected.`;
