import SplitContainer from "./components/SplitContainer";
import SplitTarget from "./components/SplitTarget";
import NeonTitle from "./components/NeonTitle";

customElements.define('split-container', SplitContainer)
customElements.define('split-target', SplitTarget)
customElements.define('neon-title', NeonTitle)

const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'styles/pages.css'
link.media = 'print'
link.onload = () => link.media = 'all'
document.head.appendChild(link)
