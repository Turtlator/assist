const nativeValueSetter = Object.getOwnPropertyDescriptor(
	HTMLTextAreaElement.prototype,
	"value",
)?.set;

/**
 * Write a value into GitHub's markdown textarea so its own editor state sees the
 * change. GitHub renders the field from React, which overrides the `value`
 * property on the element; assigning through the prototype setter and then
 * dispatching `input` is what makes React pick the new text up before Save.
 */
export function setTextareaValue(
	textarea: HTMLTextAreaElement,
	value: string,
): void {
	if (nativeValueSetter) nativeValueSetter.call(textarea, value);
	else textarea.value = value;
	textarea.dispatchEvent(new Event("input", { bubbles: true }));
	textarea.dispatchEvent(new Event("change", { bubbles: true }));
}
