export const range = document.createRange()

export function makeRoot(domString) {
	const fragment = range.createContextualFragment(domString)
	const template = /** @type {HTMLTemplateElement} */(fragment.firstElementChild)
	const style = document.querySelector('style').cloneNode(true)
	const root = template.content.cloneNode(true)
	root.insertBefore(style, root.firstChild)
	return root
}