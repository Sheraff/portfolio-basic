import template from './index.template.html'
import {makeRoot} from '../../utils/dom'
import CloneRegistry from './CloneRegistry'

const CLONE_REGISTRY = new CloneRegistry()
const FETCH_MAP = new Map()

function getPage(id) {
	if (!FETCH_MAP.has(id)) 
		FETCH_MAP.set(id, 
			fetch(`pages/${id}`)
				.then(res => res.text())
		)
	
	return FETCH_MAP.get(id)
}

export default class SplitTarget extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: 'open' })
		this.shadowRoot.appendChild(makeRoot(template))
		this.addEventListener('click', this.toggle)
		this.addEventListener('keydown', this.keydown)
		this.setAttribute('role', 'button')
		CLONE_REGISTRY.register(this)
	}

	clean() {
		const words = this.shadowRoot.querySelectorAll('.word')
		words.forEach(word => {
			word.querySelector('.mask').style.removeProperty('clip-path')
			word.querySelector('.mask').style.removeProperty('transform')
			word.querySelector('.base').style.removeProperty('clip-path')
		})
	}

	glitch([layer, mask, transform]) {
		const words = this.shadowRoot.querySelectorAll('.word')
		words.forEach(word => {
			word.querySelector('.mask').style.setProperty('clip-path', layer)
			word.querySelector('.mask').style.setProperty('transform', transform)
			word.querySelector('.base').style.setProperty('clip-path', mask)
		})
	}

	prepareAnim() {
		if (this.isPrepared)
			return
		this.isPrepared = true

		const string = this.innerText
		const fragment = document.createDocumentFragment()
		const words = string.split(' ')
		const last = words.length - 1
		words.forEach((word, i) => {
			// visible most times, masked by .mask during anim
			const base = document.createElement('span')
			base.innerText = word
			base.classList.add('base')

			// masks .base during anim
			const mask = document.createElement('span')
			mask.innerText = word
			mask.classList.add('mask')
			mask.setAttribute('aria-hidden', 'true')

			// container
			const span = document.createElement('span')
			span.classList.add('word')
			span.appendChild(base)
			span.appendChild(mask)
			fragment.appendChild(span)

			if (i !== last) {
				const space = document.createTextNode(' ')
				fragment.appendChild(space)
			}
		})
		this.innerHTML = ''
		this.shadowRoot.appendChild(fragment)
	}

	toggle() {
		this.state = !this.state
		this.dispatchEvent(new CustomEvent('split-toggle', {
			detail: this.state,
			bubbles: true
		}))
	}

	keydown(e) {
		if (e.key === 'Enter') {
			this.toggle()
		}
	}

	getContent() {
		return getPage(this.id)
	}

	get id() {
		return this.dataset.page
	}

	get state() {
		return this.dataset.state === 'true'
	}

	set state(state) {
		CLONE_REGISTRY.propagateState(this, state)
	}
}