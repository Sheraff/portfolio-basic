import template from './SplitContainer.template.html'
const range = document.createRange()
const fragment = range.createContextualFragment(template)

function makeRoot() {
	const template = /** @type {HTMLTemplateElement} */(fragment.firstElementChild)
	const style = document.querySelector('style').cloneNode(true)
	const root = template.content.cloneNode(true)
	root.insertBefore(style, root.firstChild)
	return root
}

/**
 * @param {HTMLElement} node
 * @param {HTMLElement[]} nextSiblings
 */
function findAllNextSiblings(node, nextSiblings) {
	let sibling = node
	while (
		(sibling = /** @type {HTMLElement} */ (sibling.nextElementSibling))
		&& sibling.tagName !== 'SCRIPT'
		&& sibling.tagName !== 'STYLE'
	) {
		nextSiblings.push(sibling)
	}
	if (node === document.body) {
		return nextSiblings
	} else {
		return findAllNextSiblings(node.parentElement, nextSiblings)
	}
}

export default class SplitContainer extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: 'open' })
		this.shadowRoot.appendChild(makeRoot())
		this.makeClone()
		this.makeSplit()

		// is this element open
		this.state = false

		// both standard DOM and cloned DOM events go through shadowRoot
		this.shadowRoot.addEventListener('split-toggle', this.toggle.bind(this))
	}

	// make yourself known to global registry when added to DOM
	connectedCallback() {
		if (this.isConnected) {
			SplitContainer.registry.add(this)
		}
	}

	// remove yourself from global registry when removed from DOM
	disconnectedCallback() {
		SplitContainer.registry.delete(this)
	}

	static registry = /** @type {Set<SplitContainer>} */ (new Set())

	/**
	 * if any instance from registry is open, no other instance can be open
	 * @returns {SplitContainer | null} 
	 */
	static findOpenInstance() {
		const iterator = SplitContainer.registry.values()
		let value
		while (value = iterator.next().value) {
			if (value.state) {
				return value
			}
		}
		return null
	}

	// duplicate content into shadowRoot to give illusion of splitting it into two
	makeClone() {
		this.clone = document.createElement('div')
		this.clone.classList.add('clone')
		this.clone.setAttribute('aria-hidden', 'true')
		this.clone.innerHTML = this.innerHTML
		this.shadowRoot.appendChild(this.clone)
	}

	// create slot into which to insert the content to show inside the split
	makeSplit() {
		this.split = document.createElement('div')
		this.split.setAttribute('slot', 'split')
		this.split.setAttribute('tabindex', '-1')
		this.appendChild(this.split)
	}

	toggle(e) {
		if(e.detail) {
			this.open(e.target, e.detail)
		} else {
			this.close()
		}
	}

	/**
	 * @param {import('./SplitTarget').default} target
	 * @param {string} domString
	 */
	async open(target, domString) {
		console.log()

		const otherOpenInstance = SplitContainer.findOpenInstance()
		if (otherOpenInstance) {
			await otherOpenInstance.close()
		}
		
		// update state and DOM
		this.state = true
		this.split.appendChild(range.createContextualFragment(domString))

		// create listeners and variables
		const {
			delta,
			toSibling,
		} = this.setCss(target)

		// apply transition animations
		// const animOptions = {
		// 	duration: 500,
		// 	easing: 'ease',
		// 	// fill: /** @type {FillMode} */('both'),
		// 	fill: 'none',
		// }
		
		// this.movables.forEach(movable => 
		// 	movable.animate([
		// 		{ transform: 'translateY(0px)' },
		// 		{ transform: `translateY(${toSibling}px)` },
		// 	], animOptions)
		// )
		// this.clone.animate([
		// 	{ transform: 'translateY(0px)' },
		// 	{ transform: `translateY(${delta}px)` },
		// ], animOptions)
		// this.split.animate([
		// 	{ clipPath: `inset(0 0 ${delta}px 0)` },
		// 	{ clipPath: 'inset(0 0 0 0)' }
		// ], animOptions)
		// 	.finished
		// 	.then(() => {
		// 		const scroll = window.scrollY
		// 		this.split.focus()
		// 		window.scrollTo(0, scroll)
		// 		this.style.removeProperty('pointer-events')
		// 	})
		// this.style.setProperty('pointer-events', 'none')
	
	}

	/**
	 * @param {import('./SplitTarget').default} target
	 */
	setCss(target) {
		this.movables = findAllNextSiblings(this, [])
		this.movables.forEach(movable =>
			movable.style.setProperty('transform', `translateY(var(--to-sibling, 0px))`)
		)

		const onResize = () => {
			// where split-container content is split
			const {top} = target.parentElement.getBoundingClientRect()
			const {bottom} = target.getBoundingClientRect()
			this.style.setProperty('--split', `${bottom - top}px`)

			// how much space is occupied by the content
			const delta = this.split.offsetHeight
			this.clone.style.setProperty('--delta', `${delta}px`)

			// how much space is left before the first sibling
			const siblingTop = this.movables[0].offsetTop
			const toSibling = Math.max(0, this.offsetTop + this.offsetHeight + delta - siblingTop)
			document.body.style.setProperty('--to-sibling', `${toSibling}px`)

			return {delta, toSibling}
		}
		window.addEventListener('resize', onResize)
		this.unsetCss = () => {
			this.movables.forEach(movable => movable.style.removeProperty('transform'))
			this.clone.style.removeProperty('--delta')
			document.body.style.removeProperty('--to-sibling')
			window.removeEventListener('resize', onResize)
		}
		return onResize()
	}

	/**
	 * @returns {Promise<void>} resolves when animation is complete
	 */
	close() {
		// this.movables.forEach(movable => 
		// 	movable.getAnimations().forEach(anim => {
		// 		anim.reverse()
		// 	})
		// )
		// this.movables.length = 0
		// this.clone.getAnimations().forEach(anim => {
		// 	anim.reverse()
		// })
		// this.split.getAnimations().forEach(anim => {
		// 	anim.reverse()
		// 	anim.finished.then(() => {
				this.state = false
				this.split.innerHTML = ''
		// 	})
		// })
		this.unsetCss()
		return Promise.resolve()
	}
}