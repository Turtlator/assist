# Harnesses

Shared commands must use harness-neutral names, descriptions, and help text.
Put engine-specific behaviour in the relevant harness implementation and
documentation.

For example, backlog write access maps to each harness independently. Codex
uses `workspace-write` for `--write` and `read-only` for `--no-write`.
