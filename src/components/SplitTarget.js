const FETCH_MAP = new Map()
const CLONE_MAP = new Map()

function getPage(id) {
	if (!FETCH_MAP.has(id)) 
		FETCH_MAP.set(id, 
			fetch(`pages/${id}.html`)
				.then(res => res.text())
		)
	
	return FETCH_MAP.get(id)
}

export default class SplitTarget extends HTMLElement {
	constructor() {
		super()
		getPage(this.id).then(page => {
			this.content = page
			this.addEventListener('click', this.toggle)
			this.addEventListener('keydown', this.keydown)
			this.setAttribute('role', 'button')
		})
		if(!CLONE_MAP.has(this.id)) {
			CLONE_MAP.set(this.id, [])
		}
		CLONE_MAP.get(this.id).push(this)
	}

	toggle() {
		this.state = !this.state
		this.dispatchEvent(new CustomEvent('split-toggle', {
			detail: this.state ? this.content : null,
			bubbles: true
		}))
	}

	keydown(e) {
		if (e.key === 'Enter') {
			this.toggle()
		}
	}

	get id() {
		return this.dataset.page
	}

	get state() {
		return this.dataset.state === 'true'
	}

	set state(state) {
		CLONE_MAP.get(this.id).forEach(el => {
			el.dataset.state = String(state)
		})
	}
}