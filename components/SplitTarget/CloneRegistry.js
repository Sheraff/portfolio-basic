/**
 * @typedef {import('./index').default} SplitTarget
 */

let SINGLETON
export default class CloneRegistry {
	constructor() {
		if (SINGLETON)
			return SINGLETON
		SINGLETON = this

		this.map = /** @type {Map<string, SplitTarget[]>} */ (new Map())
	}

	/** @param {SplitTarget} target */
	register(target) {
		if(!this.map.has(target.id)) {
			this.map.set(target.id, [])
		}
		this.map.get(target.id).push(target)

		if (!this.isGlitching) {
			this.isGlitching = true
			setTimeout(
				() => this.glitch(),
				Math.random() * 1000 + 500
			)
		}

		target.addEventListener('pointerenter', (e) => {
			if(e.pointerType === 'mouse')
				this.mouseEnter(target.id)
		})

		target.addEventListener('pointerleave', () => this.mouseLeave())
	}

	/** @param {string} id */
	mouseEnter(id) {
		this.endGlitch()
		this.lastId = id
		const targets = this.map.get(id)
		this.glitch(targets)
	}

	mouseLeave() {
		this.endGlitch()
		this.glitch()
	}

	/** 
	 * @param {SplitTarget} target 
	 * @param {boolean} state
	 */
	propagateState(target, state) {
		this.map.get(target.id).forEach(el => {
			el.dataset.state = String(state)
		})
	}

	/** @param {SplitTarget[] | void} targets */
	glitch(targets) {
		const state = {}
		state.targets = targets || this.getNewTargets()
		state.targets.forEach(target => target.prepareAnim())
		this.loop(state)
		this.timeout = setTimeout(() => {
			this.endGlitch()
			this.glitch()
		}, Math.random() * 4000 + 2000)
	}

	endGlitch() {
		clearTimeout(this.timeout)
		cancelAnimationFrame(this.raf)
		this.map.get(this.lastId).forEach(target => target.clean())
	}

	getNewTargets() {
		while(true) {
			const index = Math.floor(Math.random() * this.map.size)
			const [id, targets] = Array.from(this.map.entries())[index]
			if (id !== this.lastId || this.map.size < 2) {
				this.lastId = id
				return targets
			}
		}
	}

	loop(state) {
		this.raf = requestAnimationFrame((time) => {
			if (!state.nextFrame || time >= state.nextFrame) {
				if (state.glitchCount < 15) {
					state.glitchCount++
					const style = getRandomComplementaryMasks()
					state.targets.forEach(target => target.glitch(style))
					state.nextFrame = time + Math.random() * 150
				} else {
					state.glitchCount = 0
					state.targets.forEach(target => target.clean())
					state.nextFrame = time + Math.random() * 700 + 300
				}
			}
			this.loop(state)
		})
	}
}

function getRandomComplementaryMasks() {
	const size = Math.floor(Math.random() * 40 + 10) // <= change here for size of glitch
	const center = Math.floor(Math.random() * 100)
	const top = Math.min(100, Math.max(0, center - size / 2))
	const bottom = Math.min(100, Math.max(0, center + size / 2))
	const mask = `polygon(0 ${top}%, 100% ${top}%, 100% ${bottom}%, 0 ${bottom}%)`
	const masked = `polygon(0 0, 100% 0, 100% ${top}%, 0 ${top}%, 0 ${bottom}%, 100% ${bottom}%, 100% 100%, 0 100%)`
	const transform = `translateX(-${65/size}px)`
	return [mask, masked, transform]
}