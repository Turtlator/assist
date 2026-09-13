import { describeLinkTarget } from "./describeLinkTarget";

type DebugWindow = typeof globalThis & { __linkDebugInstalled?: boolean };

export function installLinkClickDebug() {
	const target = globalThis as DebugWindow;
	if (target.__linkDebugInstalled) return;
	target.__linkDebugInstalled = true;

	const inherited = Event.prototype.preventDefault;
	Event.prototype.preventDefault = function preventDefault(this: Event) {
		if (this.type === "click" || this.type === "auxclick")
			console.warn(
				"[linkdebug] preventDefault() on",
				this.type,
				describeLinkTarget(this.target),
				"\n",
				new Error("call site").stack,
			);
		return inherited.call(this);
	};

	const inheritedOpen = globalThis.open;
	globalThis.open = function open(...args: Parameters<typeof globalThis.open>) {
		console.info("[linkdebug] window.open", args);
		return inheritedOpen.apply(globalThis, args);
	};

	globalThis.addEventListener(
		"click",
		(event) => {
			console.info(
				"[linkdebug] CAPTURE",
				describeLinkTarget(event.target),
				"button:",
				event.button,
				"defaultPrevented:",
				event.defaultPrevented,
			);
			setTimeout(() => {
				console.info(
					"[linkdebug] SETTLED defaultPrevented:",
					event.defaultPrevented,
				);
			}, 0);
		},
		true,
	);

	console.info("[linkdebug] installed");
}
