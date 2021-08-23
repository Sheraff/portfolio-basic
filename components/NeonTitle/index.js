import template from './index.template.html'
import {makeRoot} from '../../utils/dom'

export default class NeonTitle extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: 'open' })
		this.shadowRoot.appendChild(makeRoot(template))

		this.heart = this.shadowRoot.querySelector('.heart')
		this.center = this.shadowRoot.querySelector('.center')
		this.name = this.shadowRoot.querySelector('.name')
		this.first = this.shadowRoot.querySelector('.first')
		this.last = this.shadowRoot.querySelector('.last')
		this.open = this.shadowRoot.querySelector('.open')
		this.close = this.shadowRoot.querySelector('.close')

		this.fillSpanFromSlot(
			this.first,
			this.shadowRoot.querySelector('slot[name=left]')
		)
		this.fillSpanFromSlot(
			this.last,
			this.shadowRoot.querySelector('slot[name=right]')
		)

		this.timeoutId = setTimeout(() => {
			this.contract()
		}, Math.random() * 10000 + 5000)

		this.addEventListener('click', this.contract)
	}

	fillSpanFromSlot(span, slot) {
		const text = slot.assignedNodes()
			.map(node => node.textContent)
			.join(' ')
		span.textContent = text
	}

	async contract() {
		clearTimeout(this.timeoutId)
		if (this.isPlaying)
			return

		this.isPlaying = true

		const {width: heartW} = this.center.getBoundingClientRect()

		await Promise.all([
			this.spin(this.heart),
			this.clip(this.center, {delay: 4000}),
			this.fromTo(this.open, 0, heartW, {delay: 4000}),
			this.fromTo(this.close, 0, -heartW, {delay: 4000}),
		])

		this.heart.style.setProperty('opacity', '0')

		this.last.style.setProperty('display', 'none')
		await this.showName(heartW)
		this.last.style.removeProperty('display')
		this.first.style.setProperty('display', 'none')
		await this.showName(heartW)
		this.first.style.removeProperty('display')

		this.heart.style.removeProperty('opacity')

		await Promise.all([
			this.unclip(this.center),
			this.fromTo(this.open, heartW, 0),
			this.fromTo(this.close, -heartW, 0),
		])

		this.isPlaying = false
	}

	async showName(from) {
		const {width: nameW} = this.name.getBoundingClientRect()

		await Promise.all([
			this.fromTo(this.open, from, -nameW/2),
			this.fromTo(this.close, -from, nameW/2),
			this.unclip(this.name)
		])

		this.open.style.setProperty('transform', `translateX(${-nameW/2}px)`)
		this.close.style.setProperty('transform', `translateX(${nameW/2}px)`)
		this.name.style.setProperty('clip-path', `inset(0)`)

		await new Promise(resolve => setTimeout(resolve, 1000))

		this.open.style.removeProperty('transform')
		this.close.style.removeProperty('transform')
		this.name.style.removeProperty('clip-path')

		await Promise.all([
			this.fromTo(this.open, -nameW/2, from),
			this.fromTo(this.close, nameW/2, -from),
			this.clip(this.name)
		])
	}

	spin(node, options) {
		return node.animate([
			{ transform: 'rotateY(0turn)' },
			{ transform: 'rotateY(7.25turn)' },
		], {
			duration: 5000,
			easing: 'ease-out',
			...options,
		}).finished
	}

	clip(node, options) {
		return node.animate([
			{ clipPath: 'inset(0)' },
			{ clipPath: 'inset(0 50%)' },
		], {
			duration: 1000,
			easing: 'ease',
			...options,
		}).finished
	}
	
	unclip(node, options) {
		return node.animate([
			{ clipPath: 'inset(0 50%)' },
			{ clipPath: 'inset(0)' },
		], {
			duration: 1000,
			easing: 'ease',
			...options,
		}).finished
	}

	fromTo(node, from, to, options) {
		return node.animate([
			{ transform: `translateX(${from}px)` },
			{ transform: `translateX(${to}px)` },
		], {
			duration: 1000,
			easing: 'ease',
			...options,
		}).finished
	}
}