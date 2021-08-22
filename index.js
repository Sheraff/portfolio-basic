(()=>{"use strict";var t={};t.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),(()=>{var e;t.g.importScripts&&(e=t.g.location+"");var s=t.g.document;if(!e&&s&&(s.currentScript&&(e=s.currentScript.src),!e)){var n=s.getElementsByTagName("script");n.length&&(e=n[n.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),t.p=e})(),(()=>{const t=document.createRange(),e=t.createContextualFragment('<template>\n\t<style>\n\t\t:host {\n\t\t\tposition: relative;\n\t\t\tdisplay: block;\n\t\t\tz-index: 0;\n\t\t\t--split: 100%;\n\t\t}\n\t\t.content {\n\t\t\tclip-path: inset(0px 0px calc(100% - var(--split)) 0px);\n\t\t}\n\t\t.clone {\n\t\t\t--delta: 0px;\n\t\t\tposition: absolute;\n\t\t\tinset: 0;\n\t\t\tclip-path: inset(var(--split) 0px 0px 0px);\n\t\t\ttransform: translateY(var(--delta));\n\t\t}\n\t\t.split {\n\t\t\tposition: absolute;\n\t\t\tinset: calc(var(--split) + .1em) 0 0;\n\t\t}\n\t\t.anim {\n\t\t\tposition: absolute;\n\t\t\ttop: calc(var(--split) + .1em);\n\t\t\tleft: 50%;\n\t\t\twidth: 100vw;\n\t\t\twill-change: transform, opacity;\n\t\t\ttransform: translate3d(0,0,0) translateX(-50%);\n\t\t\tz-index: 1;\n\t\t\topacity: 0;\n\t\t\t\n\t\t\t--y: 3;\n\t\t\tbackground-color: currentColor;\n\t\t\theight: 1px;\n\t\t}\n\t\t.go {\n\t\t\tanimation: open 500ms ease-in;\n\t\t}\n\t\t@keyframes open {\n\t\t\t\t0%  { transform: translate3d(0,0,0) translateX(-50%) scaleX(.01) scaleY(1); opacity: 0; }\n\t\t\t\t15% { transform: translate3d(0,0,0) translateX(-50%) scaleX(.05) scaleY(var(--y)); opacity: 1; }\n\t\t\t\t40% { transform: translate3d(0,0,0) translateX(-50%) scaleX(.1)  scaleY(1); opacity: 1; }\n\t\t\t\t70% { transform: translate3d(0,0,0) translateX(-50%) scaleX(.8)  scaleY(1); opacity: 1; }\n\t\t\t\tto  { transform: translate3d(0,0,0) translateX(-50%) scaleX(1)   scaleY(1); opacity: 0; }\n\t\t\t}\n\n\t\t@media (prefers-color-scheme: dark) {\n\t\t\t.anim {\n\t\t\t\t--y: 7;\n\t\t\t\theight: 2px;\n\t\t\t\tborder-radius: 5px;\n\t\t\t\tbackground-color: var(--accent);\n\t\t\t\tfilter: blur(1px);\n\t\t\t}\n\t\t}\n\t</style>\n\t<div class="content">\n\t\t<slot></slot>\n\t</div>\n\t<div class="anim"></div>\n\t<div class="split">\n\t\t<slot name="split"></slot>\n\t</div>\n</template>');function s(t,e){let n=t;for(;(n=n.nextElementSibling)&&"SCRIPT"!==n.tagName&&"STYLE"!==n.tagName;)e.push(n);return t===document.body?e:s(t.parentElement,e)}const n="ease";class i extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(function(){const t=e.firstElementChild,s=document.querySelector("style").cloneNode(!0),n=t.content.cloneNode(!0);return n.insertBefore(s,n.firstChild),n}()),this.makeClone(),this.makeSplit(),this.state=!1,this.available=Promise.resolve(),this.shadowRoot.addEventListener("split-toggle",this.toggle.bind(this))}connectedCallback(){this.isConnected&&i.registry.add(this)}disconnectedCallback(){i.registry.delete(this)}static registry=new Set;static findOpenInstance(){const t=i.registry.values();let e;for(;e=t.next().value;)if(e.state)return e;return null}makeClone(){this.clone=document.createElement("div"),this.clone.classList.add("clone"),this.clone.setAttribute("aria-hidden","true"),this.clone.innerHTML=this.innerHTML,this.shadowRoot.appendChild(this.clone)}makeSplit(){this.split=document.createElement("div"),this.split.setAttribute("slot","split"),this.split.setAttribute("tabindex","-1"),this.appendChild(this.split)}toggle(t){t.detail?this.open(t.target):this.close()}async open(e){const s=e.getContent();await this.available;const n=i.findOpenInstance();n&&await n.close(),this.positionSplit(e),await this.cssAnim();const o=await s;this.state=!0,this.split.appendChild(t.createContextualFragment(o)),this.setCss(e);const l=this.animateOpen();this.available=a(l),this.style.setProperty("pointer-events","none"),await this.available;const r=window.scrollY;this.split.focus(),window.scrollTo(0,r),this.style.removeProperty("pointer-events")}async close(){await this.available;const t=this.animateClose();this.available=a(t),this.style.setProperty("pointer-events","none"),await this.available,this.unsetCss(),this.style.removeProperty("pointer-events"),this.state=!1,this.split.innerHTML=""}setCss(t){this.movables=s(this,[]),this.movables.forEach((t=>t.style.setProperty("transform","translateY(var(--to-sibling, 0px))")));const e=()=>{this.delta=this.split.offsetHeight,this.clone.style.setProperty("--delta",`${this.delta}px`);const t=this.movables[0].offsetTop;this.toSibling=Math.max(0,this.offsetTop+this.offsetHeight+this.delta-t),document.body.style.setProperty("--to-sibling",`${this.toSibling}px`)},n=()=>{this.positionSplit(t),e()};window.addEventListener("resize",n),this.unsetCss=()=>{this.movables.forEach((t=>t.style.removeProperty("transform"))),this.clone.style.removeProperty("--delta"),document.body.style.removeProperty("--to-sibling"),window.removeEventListener("resize",n),this.delta=null,this.toSibling=null,this.movables.length=0,t.state=!1},e()}positionSplit(t){const{top:e}=t.parentElement.getBoundingClientRect(),{bottom:s}=t.getBoundingClientRect();this.style.setProperty("--split",s-e+"px")}async cssAnim(){const t=this.shadowRoot.querySelector(".anim"),e=new Promise((e=>{t.addEventListener("animationend",(()=>{t.classList.remove("go"),e()}))}));t.classList.add("go"),await e}animateOpen(){const t={duration:500,easing:n,fill:"backwards"},e=this.split.animate([{clipPath:`inset(0 -100vw ${this.delta}px)`},{clipPath:"inset(0 -100vw 0)"}],t),s=this.clone.animate([{transform:"translateY(0px)"},{transform:`translateY(${this.delta}px)`}],t);return[...this.movables.map((e=>e.animate([{transform:"translateY(0px)"},{transform:`translateY(${this.toSibling}px)`}],t))),s,e]}animateClose(){const t={duration:250,easing:n},e=this.split.animate([{clipPath:"inset(0 -100vw 0)"},{clipPath:`inset(0 -100vw ${this.delta}px)`}],t),s=this.clone.animate([{transform:`translateY(${this.delta}px)`},{transform:"translateY(0px)"}],t);return[...this.movables.map((e=>e.animate([{transform:`translateY(${this.toSibling}px)`},{transform:"translateY(0px)"}],t))),s,e]}}function a(t){return Promise.all(t.map((t=>t.finished))).then((()=>null))}const o=new Map,l=new Map;class r extends HTMLElement{constructor(){super(),this.addEventListener("click",this.toggle),this.addEventListener("keydown",this.keydown),this.setAttribute("role","button"),l.has(this.id)||l.set(this.id,[]),l.get(this.id).push(this)}toggle(){this.state=!this.state,this.dispatchEvent(new CustomEvent("split-toggle",{detail:this.state,bubbles:!0}))}keydown(t){"Enter"===t.key&&this.toggle()}getContent(){return t=this.id,o.has(t)||o.set(t,fetch(`pages/${t}.html`).then((t=>t.text()))),o.get(t);var t}get id(){return this.dataset.page}get state(){return"true"===this.dataset.state}set state(t){l.get(this.id).forEach((e=>{e.dataset.state=String(t)}))}}customElements.define("split-container",i),customElements.define("split-target",r);const c=document.createElement("link");c.rel="stylesheet",c.href="styles/pages.css",c.media="print",c.onload=()=>c.media="all",document.head.appendChild(c)})(),t.p,t.p,t.p,t.p,t.p})();