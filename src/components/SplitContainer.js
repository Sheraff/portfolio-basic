import template from 'raw-loader!./SplitContainer.html'
const range = document.createRange()
const fragment = range.createContextualFragment(template)

function makeRoot() {
	const template = /** @type {HTMLTemplateElement} */(fragment.firstElementChild)
	return template.content.cloneNode(true)
}

function findAllNextSiblings(node, nextSiblings = []) {
	let sibling = node
	while (
		(sibling = sibling.nextElementSibling)
		&& sibling.tagName !== 'SCRIPT'
		&& sibling.tagName !== 'STYLE'
	) {
		nextSiblings.push(sibling)
	}
	if (node === document.body) {
		return nextSiblings
	} else {
		return findAllNextSiblings(node.parentNode, nextSiblings)
	}
}

export default class SplitContainer extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: 'open' })
		this.shadowRoot.appendChild(makeRoot())
		this.makeClone()
		this.makeSplit()

		this.state = false
		this.shadowRoot.addEventListener('split-toggle', this.handle.bind(this))
	}

	handle(e) {
		this.open(e.target)

		if(e.detail) {
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
				})
		} else {
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