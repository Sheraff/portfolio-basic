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

const duration = 500
const easing = 'ease'

export default class SplitContainer extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: 'open' })
		this.shadowRoot.appendChild(makeRoot())
		this.makeClone()
		this.makeSplit()

		// is this element open
		this.state = false
		this.available = Promise.resolve()

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
			this.open(e.target)
		} else {
			this.close()
		}
	}

	/**
	 * @param {import('./SplitTarget').default} target
	 */
	async open(target) {
		// start fetching early while we wrap up other things
		const domStringPromise = target.getContent()

		// wait for this instance to be done doing something else
		await this.available

		// close any other instance
		const otherOpenInstance = SplitContainer.findOpenInstance()
		if (otherOpenInstance) {
			await otherOpenInstance.close()
		}

		// distract while we finish fetching
		this.positionSplit(target)
		await this.cssAnim()
		const domString = await domStringPromise
		
		// update state and DOM
		this.state = true
		this.split.appendChild(range.createContextualFragment(domString))

		// create listeners and variables
		this.setCss(target)

		// launch animations
		const animations = this.animateOpen()
		this.available = finishedAnimations(animations)

		this.style.setProperty('pointer-events', 'none')

		await this.available

		const scroll = window.scrollY
		this.split.focus()
		window.scrollTo(0, scroll)
		this.style.removeProperty('pointer-events')
	}

	async close() {
		await this.available

		const animations = this.animateClose()

		this.available = finishedAnimations(animations)

		this.style.setProperty('pointer-events', 'none')

		await this.available

		this.unsetCss()
		this.style.removeProperty('pointer-events')

		// update state and DOM
		this.state = false
		this.split.innerHTML = ''
	}

	/**
	 * @param {import('./SplitTarget').default} target
	 */
	setCss(target) {
		this.movables = findAllNextSiblings(this, [])
		this.movables.forEach(movable =>
			movable.style.setProperty('transform', `translateY(var(--to-sibling, 0px))`)
		)
		const firstPass = () => {
			// how much space is occupied by the content
			this.delta = this.split.offsetHeight
			this.clone.style.setProperty('--delta', `${this.delta}px`)

			// how much space is left before the first sibling
			const siblingTop = this.movables[0].offsetTop
			this.toSibling = Math.max(0, this.offsetTop + this.offsetHeight + this.delta - siblingTop)
			document.body.style.setProperty('--to-sibling', `${this.toSibling}px`)
		}
		const onResize = () => {
			// where split-container content is split
			this.positionSplit(target)

			// rest
			firstPass()
		}
		window.addEventListener('resize', onResize)
		this.unsetCss = () => {
			this.movables.forEach(movable => movable.style.removeProperty('transform'))
			this.clone.style.removeProperty('--delta')
			document.body.style.removeProperty('--to-sibling')
			window.removeEventListener('resize', onResize)
			this.delta = null
			this.toSibling = null
			this.movables.length = 0
			target.state = false
		}
		firstPass()
	}

	positionSplit(target) {
		const {top} = target.parentElement.getBoundingClientRect()
		const {bottom} = target.getBoundingClientRect()
		this.style.setProperty('--split', `${bottom - top}px`)
	}

	async cssAnim() {
		const cssAnim = this.shadowRoot.querySelector('.anim')
		const promise = new Promise(resolve => {
			cssAnim.addEventListener('animationend', () => {
				cssAnim.classList.remove('go')
				resolve()
			})
		})
		cssAnim.classList.add('go')
		await promise
	}

	animateOpen() {
		const options = {
			duration,
			easing,
			fill: /** @type {FillMode} */('backwards')
		}
		const splitAnim = this.split.animate([
			{ clipPath: `inset(0 -100vw ${this.delta}px)` },
			{ clipPath: 'inset(0 -100vw 0)' },
		], options)

		const cloneAnim = this.clone.animate([
			{ transform: 'translateY(0px)' },
			{ transform: `translateY(${this.delta}px)` },
		], options)

		const siblingsAnim = this.movables.map(movable => 
			movable.animate([
				{ transform: 'translateY(0px)' },
				{ transform: `translateY(${this.toSibling}px)` },
			], options)
		)

		return [...siblingsAnim, cloneAnim, splitAnim]
	}

	animateClose() {
		const options = {
			duration: duration / 2,
			easing
		}
		const splitAnim = this.split.animate([
			{ clipPath: 'inset(0 -100vw 0)' },
			{ clipPath: `inset(0 -100vw ${this.delta}px)` },
		], options)

		const cloneAnim = this.clone.animate([
			{ transform: `translateY(${this.delta}px)` },
			{ transform: 'translateY(0px)' },
		], options)

		const siblingsAnim = this.movables.map(movable => 
			movable.animate([
				{ transform: `translateY(${this.toSibling}px)` },
				{ transform: 'translateY(0px)' },
			], options)
		)
		return [...siblingsAnim, cloneAnim, splitAnim]
	}
}

/**
 * @param {Animation[]} animations
 * @return {Promise<void>}
 */
function finishedAnimations(animations) {
	return Promise
		.all(animations.map(anim => anim.finished))
		.then(() => null)
}