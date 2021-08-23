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
}