import { type MouseEvent as ReactMouseEvent, useRef } from "react";
import { type Caret, caretFromPoint } from "./caretFromPoint";
import { startCaret } from "./finishSelection";

export function useDragSelection({
	onStart,
	onMove,
	onEnd,
}: {
	onStart?: () => void;
	onMove?: (anchor: Caret, focus: Caret, wrapper: HTMLElement) => void;
	onEnd: (anchor: Caret, focus: Caret, content: HTMLElement) => void;
}) {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const anchorRef = useRef<Caret | null>(null);

	const onMouseDown = (e: ReactMouseEvent) => {
		const wrapper = wrapperRef.current;
		const content = contentRef.current;
		if (!wrapper || !content) return;
		const anchor = startCaret(wrapper, content, e.clientX, e.clientY);
		if (!anchor) return;

		e.preventDefault();
		anchorRef.current = anchor;
		onStart?.();

		const handleMove = (ev: globalThis.MouseEvent) => {
			const focus = caretFromPoint(ev.clientX, ev.clientY);
			if (focus && anchorRef.current)
				onMove?.(anchorRef.current, focus, wrapper);
		};
		const handleUp = (ev: globalThis.MouseEvent) => {
			globalThis.removeEventListener("mousemove", handleMove);
			globalThis.removeEventListener("mouseup", handleUp);
			const anchorAtStart = anchorRef.current;
			anchorRef.current = null;
			if (!anchorAtStart) return;
			const focus = caretFromPoint(ev.clientX, ev.clientY) ?? anchorAtStart;
			onEnd(anchorAtStart, focus, content);
		};
		globalThis.addEventListener("mousemove", handleMove);
		globalThis.addEventListener("mouseup", handleUp);
	};

	return { wrapperRef, contentRef, onMouseDown };
}
