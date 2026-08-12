import type { PreviewKind } from "../shared/SessionInfoBase";

const PREVIEW_KINDS: PreviewKind[] = [
	"pr",
	"backlog-item",
	"backlog-comment",
	"pr-comment",
];

export function isPreviewKind(value: unknown): value is PreviewKind {
	return PREVIEW_KINDS.includes(value as PreviewKind);
}
