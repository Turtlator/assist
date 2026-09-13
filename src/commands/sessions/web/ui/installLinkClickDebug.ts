import { describeLinkTarget } from "./describeLinkTarget";
import { watchMarkdownMutations } from "./watchMarkdownMutations";

type DebugWindow = typeof globalThis & { __linkDebugInstalled?: boolean };

const TRACKED = [
	"mousedown",
	"mouseup",
	"click",
	"auxclick",
	"dragstart",
] as const;

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

	for (const type of TRACKED)
		globalThis.addEventListener(
			type,
			(event) => {
				const mouse = event as MouseEvent;
				console.info(
					`[linkdebug] ${type} @${performance.now().toFixed(0)}`,
					describeLinkTarget(event.target),
					"button:",
					mouse.button,
					"at",
					`${mouse.clientX},${mouse.clientY}`,
					"defaultPrevented:",
					event.defaultPrevented,
				);
			},
			true,
		);

	watchMarkdownMutations();
	console.info("[linkdebug] installed v2");
}
