const KEY_EVENTS = ["keydown", "keyup", "keypress"] as const;

/**
 * Keep key events inside the shadow host. Crossing a shadow boundary retargets
 * an event, so GitHub's document-level shortcut handler sees the host div rather
 * than the textarea inside it, decides the keystroke is a page shortcut and
 * swallows it. React's own listeners live inside the shadow root, so they still
 * run before propagation stops here.
 */
export function containKeyEvents(host: HTMLElement): void {
	for (const type of KEY_EVENTS)
		host.addEventListener(type, (event) => event.stopPropagation());
}
