import template from 'raw-loader!./SplitContainer.html'
const range = document.createRange()
const fragment = range.createContextualFragment(template)

function makeRoot() {
	const template = /** @type {HTMLTemplateElement} */(fragment.firstElementChild)
	return template.content.cloneNode(true)
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
		this.shadowRoot.addEventListener('split-toggle', this.handle.bind(this))
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

	handle(e) {

		console.log(SplitContainer.findOpenInstance())
		
		if(e.detail) {
			this.state = true
			this.open(e.target)
			this.split.appendChild(range.createContextualFragment(e.detail))
			const delta = this.split.offsetHeight
			const animOptions = {
				duration: 500,
				easing: 'ease',
				fill: /** @type {FillMode} */('both'),
			}
			this.movables = findAllNextSiblings(this, [])
			const {top} = this.movables[0].getBoundingClientRect()
			const {bottom} = this.getBoundingClientRect()
			const deltaToNextSibling = top - bottom
			if (deltaToNextSibling > delta)
				this.movables.length = 0
			this.movables.forEach(movable => 
				movable.animate([
					{ transform: 'translateY(0px)' },
					{ transform: `translateY(${delta - deltaToNextSibling}px)` },
				], animOptions)
			)
			this.clone.animate([
				{ transform: 'translateY(0px)' },
				{ transform: `translateY(${delta}px)` },
			], animOptions)
			this.split.animate([
				{ clipPath: `inset(0 0 ${delta}px 0)` },
				{ clipPath: 'inset(0 0 0 0)' }
			], animOptions)
				.finished
				.then(() => {
					const scroll = window.scrollY
					this.split.focus()
					window.scrollTo(0, scroll)
					this.style.removeProperty('pointer-events')
				})
			this.style.setProperty('pointer-events', 'none')
		} else {
			this.onClose()
			this.movables.forEach(movable => 
				movable.getAnimations().forEach(anim => {
					anim.reverse()
				})
			)
			this.clone.getAnimations().forEach(anim => {
				anim.reverse()
			})
			this.split.getAnimations().forEach(anim => {
				anim.reverse()
				anim.finished.then(() => {
					this.state = false
					this.split.innerHTML = ''
				})
			})
		}
	}

	makeClone() {
		this.clone = document.createElement('div')
		this.clone.classList.add('clone')
		this.clone.setAttribute('aria-hidden', 'true')
		this.clone.innerHTML = this.innerHTML
		this.shadowRoot.appendChild(this.clone)
	}

	makeSplit() {
		this.split = document.createElement('div')
		this.split.setAttribute('slot', 'split')
		this.split.setAttribute('tabindex', '-1')
		this.appendChild(this.split)
	}

	open(target) {
		const onResize = () => {
			const {top} = target.parentElement.getBoundingClientRect()
			const {bottom} = target.getBoundingClientRect()
			this.style.setProperty('--split', `${bottom - top}px`)
		}
		onResize()
		window.addEventListener('resize', onResize)
		this.onClose = () => window.removeEventListener('resize', onResize)
	}
}