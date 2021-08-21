import SplitContainer from "./components/SplitContainer";
import SplitTarget from "./components/SplitTarget";

customElements.define('split-container', SplitContainer)
customElements.define('split-target', SplitTarget)

const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = '/styles/pages.css'
document.head.appendChild(link)
