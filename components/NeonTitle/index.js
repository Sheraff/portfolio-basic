import template from './index.template.html'
import {makeRoot} from '../../utils/dom'

const EASING = 'ease'
const DURATION = 1000
const DISTANCE_DURATION_RATIO = 13

function getDuration(distance) {
	return DURATION * Math.sqrt(distance) / DISTANCE_DURATION_RATIO
}

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

		// not very "reusable" but i want initial HTML to be as light as possible
		document.querySelector('header').style.setProperty('overflow', 'hidden')

		this.fillSpanFromSlot(
			this.first,
			this.shadowRoot.querySelector('slot[name=left]')
		)
		this.fillSpanFromSlot(
			this.last,
			this.shadowRoot.querySelector('slot[name=right]')
		)

		this.randomizeNext(5, 15)

		this.addEventListener('click', this.contract)
	}

	fillSpanFromSlot(span, slot) {
		const text = slot.assignedNodes()
			.map(node => node.textContent)
			.join(' ')
		span.textContent = text
	}

	randomizeNext(min, max) {
		this.timeoutId = setTimeout(
			() => {
				if (typeof window.requestIdleCallback === 'function') {
					this.idleId = window.requestIdleCallback(() => this.contract(), {timeout: 5000})
				} else {
					this.contract()
				}
			}, 
			Math.random() * (max - min) * 1000 + min * 1000
		)
	}

	async contract() {
		clearTimeout(this.timeoutId)
		if (window.cancelIdleCallback)
			window.cancelIdleCallback(this.idleId)
		if (this.isPlaying)
			return

		this.isPlaying = true

		const {width: heartW} = this.center.getBoundingClientRect()
		const adjustedW = heartW * 3 / 4
		const duration = getDuration(adjustedW)

		await Promise.all([
			this.spin(this.heart, {duration: 4000 + duration}),
			this.clip(this.center, {delay: 4000, duration}),
			this.fromTo(this.open, 0, adjustedW, {delay: 4000, duration}),
			this.fromTo(this.close, 0, -adjustedW, {delay: 4000, duration}),
		])

		this.heart.style.setProperty('opacity', '0')

		this.last.style.setProperty('display', 'none')
		await this.showName(adjustedW)
		this.last.style.removeProperty('display')
		this.first.style.setProperty('display', 'none')
		await this.showName(adjustedW)
		this.first.style.removeProperty('display')

		this.heart.style.removeProperty('opacity')

		await Promise.all([
			this.unClip(this.center, {duration}),
			this.fromTo(this.open, adjustedW, 0, {duration}),
			this.fromTo(this.close, -adjustedW, 0, {duration}),
		])

		this.isPlaying = false
		this.randomizeNext(30, 60)
	}

	async showName(from) {
		const {width: nameW} = this.name.getBoundingClientRect()
		const duration = getDuration(nameW)

		await Promise.all([
			this.fromTo(this.open, from, -nameW/2, {duration}),
			this.fromTo(this.close, -from, nameW/2, {duration}),
			this.unClip(this.name, {duration}),
		])

		this.open.style.setProperty('transform', `translateX(${-nameW/2}px)`)
		this.close.style.setProperty('transform', `translateX(${nameW/2}px)`)
		this.name.style.setProperty('clip-path', `inset(0)`)

		await new Promise(resolve => setTimeout(resolve, DURATION))

		this.open.style.removeProperty('transform')
		this.close.style.removeProperty('transform')
		this.name.style.removeProperty('clip-path')

		await Promise.all([
			this.fromTo(this.open, -nameW/2, from, {duration}),
			this.fromTo(this.close, nameW/2, -from, {duration}),
			this.clip(this.name, {duration}),
		])
	}

	spin(node, options) {
		return node.animate([
			{ transform: 'rotateY(0turn)' },
			{ transform: 'rotateY(7.25turn)' },
		], {
			duration: DURATION,
			easing: 'ease-out',
			...options,
		}).finished
	}

	clip(node, options) {
		return node.animate([
			{ clipPath: 'inset(0)' },
			{ clipPath: 'inset(0 50%)' },
		], {
			duration: DURATION,
			easing: EASING,
			...options,
		}).finished
	}
	
	unClip(node, options) {
		return node.animate([
			{ clipPath: 'inset(0 50%)' },
			{ clipPath: 'inset(0)' },
		], {
			duration: DURATION,
			easing: EASING,
			...options,
		}).finished
	}

	fromTo(node, from, to, options) {
		return node.animate([
			{ transform: `translateX(${from}px)` },
			{ transform: `translateX(${to}px)` },
		], {
			duration: DURATION,
			easing: EASING,
			...options,
		}).finished
	}
}