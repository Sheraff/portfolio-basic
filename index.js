(()=>{"use strict";var t={};t.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),(()=>{var e;t.g.importScripts&&(e=t.g.location+"");var s=t.g.document;if(!e&&s&&(s.currentScript&&(e=s.currentScript.src),!e)){var n=s.getElementsByTagName("script");n.length&&(e=n[n.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),t.p=e})(),(()=>{const t=document.createRange();function e(e){const s=t.createContextualFragment(e).firstElementChild,n=document.querySelector("style").cloneNode(!0),i=s.content.cloneNode(!0);return i.insertBefore(n,i.firstChild),i}function s(t,e){let n=t;for(;(n=n.nextElementSibling)&&"SCRIPT"!==n.tagName&&"STYLE"!==n.tagName;)e.push(n);return t===document.body?e:s(t.parentElement,e)}const n="ease";class i extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(e('<template>\n\t<style>\n\t\t:host {\n\t\t\tposition: relative;\n\t\t\tdisplay: block;\n\t\t\tz-index: 0;\n\t\t\t--split: 100%;\n\t\t}\n\t\t.content {\n\t\t\tclip-path: inset(0px 0px calc(100% - var(--split)) 0px);\n\t\t}\n\t\t.clone {\n\t\t\t--delta: 0px;\n\t\t\tposition: absolute;\n\t\t\tinset: 0;\n\t\t\tclip-path: inset(var(--split) 0px 0px 0px);\n\t\t\ttransform: translateY(var(--delta));\n\t\t}\n\t\t.split {\n\t\t\tposition: absolute;\n\t\t\tinset: calc(var(--split) + .1em) 0 0;\n\t\t}\n\t\t.anim {\n\t\t\tposition: absolute;\n\t\t\ttop: calc(var(--split) + .1em);\n\t\t\tleft: 50%;\n\t\t\twidth: 100vw;\n\t\t\twill-change: transform, opacity;\n\t\t\ttransform: translate3d(0,0,0) translateX(-50%);\n\t\t\tz-index: 1;\n\t\t\topacity: 0;\n\t\t\t\n\t\t\t--y: 3;\n\t\t\tbackground-color: currentColor;\n\t\t\theight: 1px;\n\t\t}\n\t\t.go {\n\t\t\tanimation: open 500ms ease-in;\n\t\t}\n\t\t@keyframes open {\n\t\t\t\t0%  { transform: translate3d(0,0,0) translateX(-50%) scaleX(.01) scaleY(1); opacity: 0; }\n\t\t\t\t15% { transform: translate3d(0,0,0) translateX(-50%) scaleX(.05) scaleY(var(--y)); opacity: 1; }\n\t\t\t\t40% { transform: translate3d(0,0,0) translateX(-50%) scaleX(.1)  scaleY(1); opacity: 1; }\n\t\t\t\t70% { transform: translate3d(0,0,0) translateX(-50%) scaleX(.8)  scaleY(1); opacity: 1; }\n\t\t\t\tto  { transform: translate3d(0,0,0) translateX(-50%) scaleX(1)   scaleY(1); opacity: 0; }\n\t\t\t}\n\n\t\t@media (prefers-color-scheme: dark) {\n\t\t\t.anim {\n\t\t\t\t--y: 7;\n\t\t\t\theight: 2px;\n\t\t\t\tborder-radius: 5px;\n\t\t\t\tbackground-color: var(--accent);\n\t\t\t\tfilter: blur(1px);\n\t\t\t}\n\t\t}\n\t</style>\n\t<div class="content">\n\t\t<slot></slot>\n\t</div>\n\t<div class="anim"></div>\n\t<div class="split">\n\t\t<slot name="split"></slot>\n\t</div>\n</template>')),this.makeClone(),this.makeSplit(),this.state=!1,this.available=Promise.resolve(),this.shadowRoot.addEventListener("split-toggle",this.toggle.bind(this))}connectedCallback(){this.isConnected&&i.registry.add(this)}disconnectedCallback(){i.registry.delete(this)}static registry=new Set;static findOpenInstance(){const t=i.registry.values();let e;for(;e=t.next().value;)if(e.state)return e;return null}makeClone(){this.clone=document.createElement("div"),this.clone.classList.add("clone"),this.clone.setAttribute("aria-hidden","true"),this.clone.innerHTML=this.innerHTML,this.shadowRoot.appendChild(this.clone)}makeSplit(){this.split=document.createElement("div"),this.split.setAttribute("slot","split"),this.split.setAttribute("tabindex","-1"),this.appendChild(this.split)}toggle(t){t.detail?this.open(t.target):this.close()}async open(e){const s=e.getContent();await this.available;const n=i.findOpenInstance();n&&await n.close(),this.positionSplit(e),await this.cssAnim();const o=await s;this.state=!0,this.split.appendChild(t.createContextualFragment(o)),this.setCss(e);const r=this.animateOpen();this.available=a(r),this.style.setProperty("pointer-events","none"),await this.available;const l=window.scrollY;this.split.focus(),window.scrollTo(0,l),this.style.removeProperty("pointer-events")}async close(){await this.available;const t=this.animateClose();this.available=a(t),this.style.setProperty("pointer-events","none"),await this.available,this.unsetCss(),this.style.removeProperty("pointer-events"),this.state=!1,this.split.innerHTML=""}setCss(t){this.movables=s(this,[]),this.movables.forEach((t=>t.style.setProperty("transform","translateY(var(--to-sibling, 0px))")));const e=()=>{this.delta=this.split.offsetHeight,this.clone.style.setProperty("--delta",`${this.delta}px`);const t=this.movables[0].offsetTop;this.toSibling=Math.max(0,this.offsetTop+this.offsetHeight+this.delta-t),document.body.style.setProperty("--to-sibling",`${this.toSibling}px`)},n=()=>{this.positionSplit(t),e()};window.addEventListener("resize",n),this.unsetCss=()=>{this.movables.forEach((t=>t.style.removeProperty("transform"))),this.clone.style.removeProperty("--delta"),document.body.style.removeProperty("--to-sibling"),window.removeEventListener("resize",n),this.delta=null,this.toSibling=null,this.movables.length=0,t.state=!1},e()}positionSplit(t){const{top:e}=t.parentElement.getBoundingClientRect(),{bottom:s}=t.getBoundingClientRect();this.style.setProperty("--split",s-e+"px")}async cssAnim(){const t=this.shadowRoot.querySelector(".anim"),e=new Promise((e=>{t.addEventListener("animationend",(()=>{t.classList.remove("go"),e()}))}));t.classList.add("go"),await e}animateOpen(){const t={duration:500,easing:n,fill:"backwards"},e=this.split.animate([{clipPath:`inset(0 -100vw ${this.delta}px)`},{clipPath:"inset(0 -100vw 0)"}],t),s=this.clone.animate([{transform:"translateY(0px)"},{transform:`translateY(${this.delta}px)`}],t);return[...this.movables.map((e=>e.animate([{transform:"translateY(0px)"},{transform:`translateY(${this.toSibling}px)`}],t))),s,e]}animateClose(){const t={duration:250,easing:n},e=this.split.animate([{clipPath:"inset(0 -100vw 0)"},{clipPath:`inset(0 -100vw ${this.delta}px)`}],t),s=this.clone.animate([{transform:`translateY(${this.delta}px)`},{transform:"translateY(0px)"}],t);return[...this.movables.map((e=>e.animate([{transform:`translateY(${this.toSibling}px)`},{transform:"translateY(0px)"}],t))),s,e]}}function a(t){return Promise.all(t.map((t=>t.finished))).then((()=>null))}let o;const r=new class{constructor(){if(o)return o;o=this,this.map=new Map}register(t){this.map.has(t.id)||this.map.set(t.id,[]),this.map.get(t.id).push(t),this.isGlitching||(this.isGlitching=!0,setTimeout((()=>this.glitch()),1e3*Math.random()+500)),t.addEventListener("pointerenter",(e=>{"mouse"===e.pointerType&&this.mouseEnter(t.id)})),t.addEventListener("pointerleave",(()=>this.mouseLeave()))}mouseEnter(t){this.endGlitch(),this.lastId=t;const e=this.map.get(t);this.glitch(e)}mouseLeave(){this.endGlitch(),this.glitch()}propagateState(t,e){this.map.get(t.id).forEach((t=>{t.dataset.state=String(e)}))}glitch(t){const e={};e.targets=t||this.getNewTargets(),e.targets.forEach((t=>t.prepareAnim())),this.loop(e),this.timeout=setTimeout((()=>{this.endGlitch(),this.glitch()}),4e3*Math.random()+2e3)}endGlitch(){clearTimeout(this.timeout),cancelAnimationFrame(this.raf),this.map.get(this.lastId).forEach((t=>t.clean()))}getNewTargets(){for(;;){const t=Math.floor(Math.random()*this.map.size),[e,s]=Array.from(this.map.entries())[t];if(e!==this.lastId||this.map.size<2)return this.lastId=e,s}}loop(t){this.raf=requestAnimationFrame((e=>{if(!t.nextFrame||e>=t.nextFrame)if(t.glitchCount<15){t.glitchCount++;const s=function(){const t=Math.floor(40*Math.random()+10),e=Math.floor(100*Math.random()),s=Math.min(100,Math.max(0,e-t/2)),n=Math.min(100,Math.max(0,e+t/2));return[`polygon(0 ${s}%, 100% ${s}%, 100% ${n}%, 0 ${n}%)`,`polygon(0 0, 100% 0, 100% ${s}%, 0 ${s}%, 0 ${n}%, 100% ${n}%, 100% 100%, 0 100%)`,`translateX(-${65/t}px)`]}();t.targets.forEach((t=>t.glitch(s))),t.nextFrame=e+150*Math.random()}else t.glitchCount=0,t.targets.forEach((t=>t.clean())),t.nextFrame=e+700*Math.random()+300;this.loop(t)}))}},l=new Map;class h extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(e("<template>\n\t<style>\n\t\t:host {\n\t\t\tdisplay: inline-block;\n\t\t}\n\t\tspan {\n\t\t\tdisplay: inline-block;\n\t\t\tposition: relative;\n\t\t\ttext-decoration: underline;\n\t\t}\n\t\t.base,\n\t\t.mask {\n\t\t\twill-change: clip-path, transform;\n\t\t}\n\t\t.mask {\n\t\t\tposition: absolute;\n\t\t\tinset: 0;\n\t\t\tuser-select: none;\n\t\t\tclip-path: inset(100%);\n\t\t\tcolor: #8e0943;\n\t\t}\n\t\t@media (prefers-color-scheme: dark) {\n\t\t\t.mask {\n\t\t\t\tcolor: #eab3cb;\n\t\t\t}\n\t\t}\n</style>\n<slot></slot>\n</template>")),this.addEventListener("click",this.toggle),this.addEventListener("keydown",this.keydown),this.setAttribute("role","button"),r.register(this)}clean(){this.shadowRoot.querySelectorAll(".word").forEach((t=>{t.querySelector(".mask").style.removeProperty("clip-path"),t.querySelector(".mask").style.removeProperty("transform"),t.querySelector(".base").style.removeProperty("clip-path")}))}glitch([t,e,s]){this.shadowRoot.querySelectorAll(".word").forEach((n=>{n.querySelector(".mask").style.setProperty("clip-path",t),n.querySelector(".mask").style.setProperty("transform",s),n.querySelector(".base").style.setProperty("clip-path",e)}))}prepareAnim(){if(this.isPrepared)return;this.isPrepared=!0;const t=this.innerText,e=document.createDocumentFragment(),s=t.split(" "),n=s.length-1;s.forEach(((t,s)=>{const i=document.createElement("span");i.innerText=t,i.classList.add("base");const a=document.createElement("span");a.innerText=t,a.classList.add("mask"),a.setAttribute("aria-hidden","true");const o=document.createElement("span");if(o.classList.add("word"),o.appendChild(i),o.appendChild(a),e.appendChild(o),s!==n){const t=document.createTextNode(" ");e.appendChild(t)}})),this.innerHTML="",this.shadowRoot.appendChild(e)}toggle(){this.state=!this.state,this.dispatchEvent(new CustomEvent("split-toggle",{detail:this.state,bubbles:!0}))}keydown(t){"Enter"===t.key&&this.toggle()}getContent(){return t=this.id,l.has(t)||l.set(t,fetch(`pages/${t}`).then((t=>t.text()))),l.get(t);var t}get id(){return this.dataset.page}get state(){return"true"===this.dataset.state}set state(t){r.propagateState(this,t)}}const c="ease",p=1e3;function d(t){return p*Math.sqrt(t)/13}class m extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(e('<template>\n\t<style>\n\t\t:host {\n\t\t\tcursor: pointer;\n\t\t\tperspective: 50px;\n\t\t\tperspective-origin: center 20%;\n\t\t}\n\n\t\tspan {\n\t\t\tdisplay: inline-block;\n\t\t}\n\n\t\t.center {\n\t\t\tposition: relative;\n\t\t}\n\n\t\t.name {\n\t\t\tposition: absolute;\n\t\t\tleft: 50%;\n\t\t\ttransform: translateX(-50%);\n\t\t\tclip-path: inset(0 50%);\n\t\t}\n\n\t\t.spin {\n\t\t\tanimation: 5s ease-out 0s infinite spin;\n\t\t}\n\t\t\n\t\t.pump {\n\t\t\tanimation: 1s ease-in-out 0s infinite pump;\n\t\t}\n\n\t\t@keyframes spin {\n\t\t\tfrom { transform: rotateY(0turn); }\n\t\t\tto   { transform: rotateY(7.25turn); }\n\t\t}\n\n\t\t@keyframes pump {\n\t\t\t0%  { transform: scale(1)   }\n\t\t\t10% { transform: scale(1.2) }\n\t\t\t50%  { transform: scale(1)   }\n\t\t}\n\t\t\n\t</style>\n\t<span class="open"><slot name="open"></slot></span>\n\t<span class="center">\n\t\t<span class="name">\n\t\t\t<span class="first"></span>\n\t\t\t<span class="last"></span>\n\t\t</span>\n\t\t\x3c!-- <span class="pump"> --\x3e\n\t\t\t\x3c!-- <span class="spin"> --\x3e\n\t\t\t\t<span class="heart">\n\t\t\t\t\t<slot name="heart"></slot>\n\t\t\t\t</span>\n\t\t\t\x3c!-- </span> --\x3e\n\t\t\x3c!-- </span> --\x3e\n\t</span>\n\t<span class="close"><slot name="close"></slot></span>\n\t<span class="left"><slot name="left"></slot></span>\n\t<span class="right"><slot name="right"></slot></span>\n</template>')),this.heart=this.shadowRoot.querySelector(".heart"),this.center=this.shadowRoot.querySelector(".center"),this.name=this.shadowRoot.querySelector(".name"),this.first=this.shadowRoot.querySelector(".first"),this.last=this.shadowRoot.querySelector(".last"),this.open=this.shadowRoot.querySelector(".open"),this.close=this.shadowRoot.querySelector(".close"),document.querySelector("header").style.setProperty("overflow","hidden"),this.fillSpanFromSlot(this.first,this.shadowRoot.querySelector("slot[name=left]")),this.fillSpanFromSlot(this.last,this.shadowRoot.querySelector("slot[name=right]")),this.randomizeNext(5,15),this.addEventListener("click",this.contract)}fillSpanFromSlot(t,e){const s=e.assignedNodes().map((t=>t.textContent)).join(" ");t.textContent=s}randomizeNext(t,e){this.timeoutId=setTimeout((()=>{"function"==typeof window.requestIdleCallback?this.idleId=window.requestIdleCallback((()=>this.contract()),{timeout:5e3}):this.contract()}),Math.random()*(e-t)*1e3+1e3*t)}async contract(){if(clearTimeout(this.timeoutId),window.cancelIdleCallback&&window.cancelIdleCallback(this.idleId),this.isPlaying)return;this.isPlaying=!0;const{width:t}=this.center.getBoundingClientRect(),e=3*t/4,s=d(e);await Promise.all([this.spin(this.heart,{duration:4e3+s}),this.clip(this.center,{delay:4e3,duration:s}),this.fromTo(this.open,0,e,{delay:4e3,duration:s}),this.fromTo(this.close,0,-e,{delay:4e3,duration:s})]),this.heart.style.setProperty("opacity","0"),this.last.style.setProperty("display","none"),await this.showName(e),this.last.style.removeProperty("display"),this.first.style.setProperty("display","none"),await this.showName(e),this.first.style.removeProperty("display"),this.heart.style.removeProperty("opacity"),await Promise.all([this.unClip(this.center,{duration:s}),this.fromTo(this.open,e,0,{duration:s}),this.fromTo(this.close,-e,0,{duration:s})]),this.isPlaying=!1,this.randomizeNext(30,60)}async showName(t){const{width:e}=this.name.getBoundingClientRect(),s=d(e);await Promise.all([this.fromTo(this.open,t,-e/2,{duration:s}),this.fromTo(this.close,-t,e/2,{duration:s}),this.unClip(this.name,{duration:s})]),this.open.style.setProperty("transform",`translateX(${-e/2}px)`),this.close.style.setProperty("transform",`translateX(${e/2}px)`),this.name.style.setProperty("clip-path","inset(0)"),await new Promise((t=>setTimeout(t,p))),this.open.style.removeProperty("transform"),this.close.style.removeProperty("transform"),this.name.style.removeProperty("clip-path"),await Promise.all([this.fromTo(this.open,-e/2,t,{duration:s}),this.fromTo(this.close,e/2,-t,{duration:s}),this.clip(this.name,{duration:s})])}spin(t,e){return t.animate([{transform:"rotateY(0turn)"},{transform:"rotateY(7.25turn)"}],{duration:p,easing:"ease-out",...e}).finished}clip(t,e){return t.animate([{clipPath:"inset(0)"},{clipPath:"inset(0 50%)"}],{duration:p,easing:c,...e}).finished}unClip(t,e){return t.animate([{clipPath:"inset(0 50%)"},{clipPath:"inset(0)"}],{duration:p,easing:c,...e}).finished}fromTo(t,e,s,n){return t.animate([{transform:`translateX(${e}px)`},{transform:`translateX(${s}px)`}],{duration:p,easing:c,...n}).finished}}customElements.define("split-container",i),customElements.define("split-target",h),customElements.define("neon-title",m);const u=document.createElement("link");u.rel="stylesheet",u.href="styles/pages.css",u.media="print",u.onload=()=>u.media="all",document.head.appendChild(u)})(),t.p,t.p,t.p,t.p,t.p})();