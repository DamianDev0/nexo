// <vs-tooltip> — native Web Component. ZERO dependencies. Copy this one file,
// then use <vs-tooltip content="Save">Hover me</vs-tooltip> anywhere: React,
// Svelte, Vue, vanilla. Standard customElements API — no framework, no runtime.
//
// Port of VsTooltip.vue + TooltipHost.vue (see foundry/src/components/vue/
// VsTooltip/). The Vue source keeps ONE shared reactive `tip` object and a
// single TooltipHost teleported to <body>, painted by whichever anchor last
// called showTip(el, opts) — any button on the page can drive the same
// floating bubble, which glides + blur-swaps its content when the anchor
// changes. That is a page-wide singleton wired through a module-level
// `reactive()` — there is no vanilla equivalent to "any component anywhere
// can push into a shared store" without inventing one, so this port keeps the
// portal/teleport MECHANISM (a bubble is a separate element appended to
// <body>, with its OWN shadow root — no global stylesheet needed, exactly
// per the repo's teleport convention) but scopes ONE bubble PER <vs-tooltip>
// instance instead of one bubble for the whole document. Each instance still
// "teleports on hover, hides on leave" (built once in connectedCallback,
// removed in disconnectedCallback) — same portal behavior, just not a
// cross-instance singleton. See the class doc below for the full mapping.
//
// API:
//   attrs   → content (text/markup, v-html equivalent → innerHTML),
//             placement (top|bottom|left|right, default top; flips to the
//             opposite side automatically if the preferred side is clipped
//             by the viewport — the Vue source does not do this, added here
//             per spec since the bubble is teleported and can land anywhere),
//             variant (solid|fluent|glass|outline, default solid),
//             radius (none|subtle|rounded|pill|squircle, default squircle),
//             offset (px gap between anchor and bubble, default 10),
//             delay (show delay ms, default 120 — Vue source has no show
//             delay of its own; kept for parity with the sibling
//             vs-tooltip-*.js variants), hide-delay (ms, default 90 — mirrors
//             tooltip.ts's hideTip(delay=90), the anti-flicker window that
//             lets you cross the gap between anchor and bubble without it
//             disappearing)
//   slot    → trigger content (falls back to "Hover me")
//   events  → show (bubbles, fired on the fresh pop-in — not on a content
//             update while already visible) / hide (fired once the exit
//             animation finishes and the bubble is fully hidden again)
//   methods → el.show() / el.hide()  (imperative parity with showTip/hideTip)

const reduced = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** duration of the exit animation (must match the CSS keyframe below) */
const EXIT_MS = 360
/** duration of the enter pop (must match the CSS keyframe below) */
const ENTER_MS = 340

// Trigger-wrap CSS — lives in THIS element's own shadow root.
const CSS = `
  :host { display: inline-flex; }
  .vstip-wrap { position: relative; display: inline-flex; }
  .vstip-trigger { display: inline-flex; align-items: center; outline: none; border-radius: var(--ctrl-r-sm, 8px); color: var(--text, #ededed); cursor: default; }
  .vstip-trigger:focus-visible { box-shadow: 0 0 0 2px var(--accent, #5b8cff); }
`

// Bubble CSS — lives in the TELEPORTED element's own shadow root (ported
// verbatim, class names kept, from TooltipHost.vue's <style> block).
const BUBBLE_CSS = `
  .vstip-host {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10000;
    display: inline-flex;
    pointer-events: none;
    transition: transform 420ms cubic-bezier(0.34, 1.46, 0.44, 1);
  }
  .vstip-host__box {
    position: relative;
    display: inline-flex;
    align-items: center;
    max-width: 260px;
    padding: 7px 11px;
    border-radius: calc(var(--vstip-r, 10px) * var(--vstip-r-mult, 1));
    font-size: 12.5px;
    font-weight: 500;
    line-height: 1.4;
    color: var(--vstip-fg, #ededed);
    background: var(--vstip-surface, #1c1c1e);
    box-shadow: var(--vstip-shadow, none);
    white-space: normal;
    overflow: hidden;
    box-sizing: border-box;
    transform-origin: var(--vstip-origin, bottom center);
    --exit-x: 0px;
    --exit-y: 8px;
    opacity: 0;
    filter: blur(8px);
    scale: 0.86;
  }
  .vstip-host__box.is-visible { opacity: 1; filter: blur(0); scale: 1; }
  .vstip-host__box.is-entering { animation: vstip-pop 320ms cubic-bezier(0.34, 1.46, 0.44, 1); }
  @keyframes vstip-pop {
    0%   { opacity: 0; scale: 0.7; filter: blur(8px); translate: var(--exit-x) var(--exit-y); }
    60%  { opacity: 1; scale: 1.04; filter: blur(0); translate: 0 0; }
    100% { opacity: 1; scale: 1; translate: 0 0; }
  }
  .vstip-host__box.is-exiting {
    animation: vstip-out 360ms cubic-bezier(0.36, 0, 0.66, -0.36) forwards;
    pointer-events: none;
  }
  @keyframes vstip-out {
    0%   { opacity: 1; scale: 1; filter: blur(0); translate: 0 0; }
    30%  { scale: 1.05; translate: 0 0; }
    100% { opacity: 0; scale: 0.6; filter: blur(8px); translate: var(--exit-x) var(--exit-y); }
  }
  .vstip-host__content {
    display: inline-block;
    flex: none;
    max-width: 238px;
    transform-origin: center;
  }
  .vstip-host__content.is-swapping { animation: vstip-swap 400ms cubic-bezier(0.34, 1.46, 0.44, 1); }
  .vstip-host__content :where(b, strong) { font-weight: 700; }
  .vstip-host__content kbd {
    display: inline-block;
    min-width: 1.4em;
    padding: 1px 5px;
    margin: 0 1px;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.14);
    font: inherit;
    font-size: 0.92em;
    text-align: center;
  }
  @keyframes vstip-swap {
    0%   { filter: blur(0); opacity: 1;    scale: 1; }
    40%  { filter: blur(5px); opacity: 0.3; scale: 0.9; }
    70%  { filter: blur(0); opacity: 1;    scale: 1.03; }
    100% { filter: blur(0); opacity: 1;    scale: 1; }
  }
  .vstip-host__box--top    { --vstip-origin: bottom center; --exit-x: 0px;  --exit-y: 8px;  }
  .vstip-host__box--bottom { --vstip-origin: top center;    --exit-x: 0px;  --exit-y: -8px; }
  .vstip-host__box--left   { --vstip-origin: right center;  --exit-x: 8px;  --exit-y: 0px;  }
  .vstip-host__box--right  { --vstip-origin: left center;   --exit-x: -8px; --exit-y: 0px;  }
  .vstip-host__arrow {
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--vstip-surface, #1c1c1e);
    border-radius: 2px;
    z-index: -1;
    opacity: 0;
    filter: blur(6px);
    scale: 0;
    transform-origin: var(--arrow-origin, center top);
    transition: opacity 180ms ease, filter 180ms ease, scale 240ms cubic-bezier(0.34, 1.56, 0.44, 1);
  }
  .vstip-host__arrow.is-visible { opacity: 1; filter: blur(0); scale: 1; }
  .vstip-host__arrow.is-entering { animation: vstip-arrow-pop 420ms cubic-bezier(0.34, 1.56, 0.44, 1); }
  .vstip-host__arrow.is-exiting { opacity: 0; filter: blur(4px); scale: 0.2; }
  @keyframes vstip-arrow-pop {
    0%   { scale: 0; }
    55%  { scale: 1.3; }
    78%  { scale: 0.92; }
    100% { scale: 1; }
  }
  .vstip-host__arrow--top    { bottom: 0; left: 50%; transform: translate(-50%, 50%) rotate(45deg);  --arrow-origin: center top; }
  .vstip-host__arrow--bottom { top: 0;    left: 50%; transform: translate(-50%, -50%) rotate(45deg); --arrow-origin: center bottom; }
  .vstip-host__arrow--left   { right: 0;  top: 50%;  transform: translate(50%, -50%) rotate(45deg);  --arrow-origin: left center; }
  .vstip-host__arrow--right  { left: 0;   top: 50%;  transform: translate(-50%, -50%) rotate(45deg); --arrow-origin: right center; }
  .vstip-host__arrow--v-fluent  { background: color-mix(in srgb, #2a2a30 90%, transparent); }
  .vstip-host__arrow--v-outline { background: #000; }
  .vstip-host__arrow--v-glass   { background: rgba(124, 124, 134, 0.22); }
  .vstip-host__box { --vstip-r: 10px; }
  .vstip-host__box--r-none    { --vstip-r: 0px; }
  .vstip-host__box--r-subtle  { --vstip-r: 6px; }
  .vstip-host__box--r-rounded { --vstip-r: 10px; }
  .vstip-host__box--r-pill    { --vstip-r: 999px; }
  @supports (corner-shape: squircle) {
    .vstip-host__box--r-squircle { corner-shape: squircle; --vstip-r-mult: 1.6; }
  }
  .vstip-host__box--r-squircle { --vstip-r: 12px; }
  .vstip-host__box--v-fluent {
    --vstip-surface: color-mix(in srgb, #2a2a30 90%, transparent);
    --vstip-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(12px);
  }
  .vstip-host__box--v-outline {
    --vstip-surface: #000;
    --vstip-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
  }
  .vstip-host__box--v-glass {
    --vstip-surface: rgba(124, 124, 134, 0.22);
    --vstip-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.32);
    backdrop-filter: blur(16px) saturate(160%);
  }
  @media (prefers-reduced-motion: reduce) {
    .vstip-host, .vstip-host__box, .vstip-host__arrow, .vstip-host__content { transition: none; animation: none; }
  }
`

let _uid = 0

class VsTooltip extends HTMLElement {
  static observedAttributes = [
    'content',
    'placement',
    'variant',
    'radius',
    'offset',
    'delay',
    'hide-delay',
  ]

  #wrap
  #trigger
  #bubble
  #box
  #content
  #arrowEl
  #tipId = `vstip-${(++_uid).toString(36)}-${Math.random().toString(36).slice(2, 7)}`

  #showTimer = null
  #hideTimer = null
  #enterTimer = null
  #exitTimer = null

  #visible = false
  #entering = false
  #exiting = false
  #lastContent = null
  #curVariant = null
  #curRadius = null
  #curPlacement = null
  #reposition = () => {
    if (this.#visible) this.#applyPosition()
  }

  // arrow-fn fields (not bound methods) → stable refs for add/removeEventListener symmetry
  #onEnter = () => this.#requestShow()
  #onLeave = () => this.#requestHide()
  #onFocusIn = () => this.#requestShow()
  #onFocusOut = () => this.#requestHide()

  constructor() {
    super()
    const root = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = CSS

    // Trigger shell — built ONCE, never rebuilt.
    this.#wrap = document.createElement('span')
    this.#wrap.className = 'vstip-wrap'

    this.#trigger = document.createElement('span')
    this.#trigger.className = 'vstip-trigger'
    this.#trigger.tabIndex = 0
    const slot = document.createElement('slot')
    slot.textContent = 'Hover me' // fallback content, same as Vue <slot>Hover me</slot>
    this.#trigger.appendChild(slot)
    this.#wrap.appendChild(this.#trigger)
    root.append(style, this.#wrap)

    this.#wrap.addEventListener('mouseenter', this.#onEnter)
    this.#wrap.addEventListener('mouseleave', this.#onLeave)
    this.#wrap.addEventListener('focusin', this.#onFocusIn)
    this.#wrap.addEventListener('focusout', this.#onFocusOut)

    // ── the TELEPORT: a separate custom element, own shadow root, appended
    // to <body> in connectedCallback and removed in disconnectedCallback.
    // Positioned fixed at (0,0) and moved purely via `transform` (like
    // TooltipHost's .vstip-host), so it never causes layout shove anywhere,
    // including inside its own body-level box (it is out of flow from the
    // start — no reflow of surrounding page content ever happens).
    this.#bubble = document.createElement('div')
    const bubbleShadow = this.#bubble.attachShadow({ mode: 'open' })
    const bubbleStyle = document.createElement('style')
    bubbleStyle.textContent = BUBBLE_CSS

    const host = document.createElement('div')
    host.className = 'vstip-host'
    host.setAttribute('role', 'tooltip')
    host.id = this.#tipId

    this.#box = document.createElement('div')
    this.#box.className = 'vstip-host__box'

    this.#content = document.createElement('span')
    this.#content.className = 'vstip-host__content'

    this.#arrowEl = document.createElement('span')
    this.#arrowEl.className = 'vstip-host__arrow'
    this.#arrowEl.setAttribute('aria-hidden', 'true')

    this.#box.appendChild(this.#content)
    host.append(this.#box, this.#arrowEl)
    bubbleShadow.append(bubbleStyle, host)
  }

  connectedCallback() {
    if (!this.#bubble.isConnected) document.body.appendChild(this.#bubble)
    this.#sync()
  }

  disconnectedCallback() {
    clearTimeout(this.#showTimer)
    this.#showTimer = null
    clearTimeout(this.#hideTimer)
    this.#hideTimer = null
    clearTimeout(this.#enterTimer)
    this.#enterTimer = null
    clearTimeout(this.#exitTimer)
    this.#exitTimer = null
    this.#wrap.removeEventListener('mouseenter', this.#onEnter)
    this.#wrap.removeEventListener('mouseleave', this.#onLeave)
    this.#wrap.removeEventListener('focusin', this.#onFocusIn)
    this.#wrap.removeEventListener('focusout', this.#onFocusOut)
    removeEventListener('scroll', this.#reposition, true)
    removeEventListener('resize', this.#reposition)
    this.#bubble.remove() // CRITICAL — never leave a teleported bubble in <body>
    this.#visible = this.#entering = this.#exiting = false
  }

  attributeChangedCallback() {
    if (this.#wrap) this.#sync()
  }

  // ── imperative parity with showTip()/hideTip() ──────────────────────────
  show() {
    this.#requestShow()
  }
  hide() {
    this.#requestHide()
  }

  // ── hover/focus intent (mirrors tooltip.ts's debounced show/hide) ───────
  #requestShow() {
    clearTimeout(this.#hideTimer)
    this.#hideTimer = null
    const delay = Math.max(0, Number(this.getAttribute('delay') ?? 120) || 0)
    clearTimeout(this.#showTimer)
    this.#showTimer = setTimeout(() => {
      this.#showTimer = null
      this.#doShow()
    }, delay)
  }

  #requestHide() {
    clearTimeout(this.#showTimer)
    this.#showTimer = null
    const delay = Math.max(0, Number(this.getAttribute('hide-delay') ?? 90) || 0)
    clearTimeout(this.#hideTimer)
    this.#hideTimer = setTimeout(() => {
      this.#hideTimer = null
      this.#doHide()
    }, delay)
  }

  #doShow() {
    clearTimeout(this.#exitTimer)
    this.#exitTimer = null
    this.#exiting = false

    const content = this.getAttribute('content') ?? 'Tooltip'
    const contentChanged = content !== this.#lastContent
    const wasVisible = this.#visible // exit was just cancelled above → this is the true "already alive" state

    this.#applyContent(content, wasVisible && contentChanged)
    this.#applyVariant()
    this.#applyPosition()

    this.#box.classList.remove('is-exiting')
    this.#arrowEl.classList.remove('is-exiting')
    this.#box.classList.add('is-visible')
    this.#arrowEl.classList.add('is-visible')

    if (!wasVisible) {
      // fresh enter → one-shot pop (never re-fires while already visible)
      this.#entering = true
      this.#box.classList.add('is-entering')
      this.#arrowEl.classList.add('is-entering')
      clearTimeout(this.#enterTimer)
      this.#enterTimer = setTimeout(() => {
        this.#enterTimer = null
        this.#entering = false
        this.#box.classList.remove('is-entering')
        this.#arrowEl.classList.remove('is-entering')
      }, ENTER_MS)
      this.#trigger.setAttribute('aria-describedby', this.#tipId)
      addEventListener('scroll', this.#reposition, true)
      addEventListener('resize', this.#reposition)
      this.dispatchEvent(new CustomEvent('show', { bubbles: true, composed: true }))
    }

    this.#visible = true
  }

  #doHide() {
    if (!this.#visible) return
    this.#exiting = true
    this.#entering = false
    clearTimeout(this.#enterTimer)
    this.#enterTimer = null
    this.#box.classList.remove('is-visible', 'is-entering')
    this.#arrowEl.classList.remove('is-visible', 'is-entering')
    this.#trigger.removeAttribute('aria-describedby')

    const finish = () => {
      this.#exitTimer = null
      this.#visible = false
      this.#exiting = false
      this.#box.classList.remove('is-exiting')
      this.#arrowEl.classList.remove('is-exiting')
      removeEventListener('scroll', this.#reposition, true)
      removeEventListener('resize', this.#reposition)
      this.dispatchEvent(new CustomEvent('hide', { bubbles: true, composed: true }))
    }

    if (reduced()) {
      finish()
      return
    }
    this.#box.classList.add('is-exiting')
    this.#arrowEl.classList.add('is-exiting')
    clearTimeout(this.#exitTimer)
    this.#exitTimer = setTimeout(finish, EXIT_MS)
  }

  // ── content (v-html port) + blur-swap when it changes while already open ──
  #applyContent(content, animateSwap) {
    if (content === this.#lastContent) return
    this.#lastContent = content
    this.#content.innerHTML = content // faithful port of Vue v-html
    if (!animateSwap) return
    // restart the CSS animation even if it was mid-flight (rapid content swaps)
    this.#content.classList.remove('is-swapping')
    void this.#content.offsetWidth
    this.#content.classList.add('is-swapping')
  }

  // Note: mutates individual classes (never overwrites className wholesale)
  // so state classes (is-visible/is-entering/is-exiting) and the placement
  // class survive being called at any time, including while the bubble is
  // open (e.g. a `variant` attribute change mid-hover).
  #applyVariant() {
    const variant = this.getAttribute('variant') || 'solid'
    const radius = this.getAttribute('radius') || 'squircle'
    if (this.#curVariant !== variant) {
      if (this.#curVariant) {
        this.#box.classList.remove(`vstip-host__box--v-${this.#curVariant}`)
        this.#arrowEl.classList.remove(`vstip-host__arrow--v-${this.#curVariant}`)
      }
      this.#box.classList.add(`vstip-host__box--v-${variant}`)
      this.#arrowEl.classList.add(`vstip-host__arrow--v-${variant}`)
      this.#curVariant = variant
    }
    if (this.#curRadius !== radius) {
      if (this.#curRadius) this.#box.classList.remove(`vstip-host__box--r-${this.#curRadius}`)
      this.#box.classList.add(`vstip-host__box--r-${radius}`)
      this.#curRadius = radius
    }
  }

  // ── positioning: anchor point per placement (ported from tooltip.ts's
  // anchorPoint()) + viewport-aware flip-if-clipped (not in the Vue source —
  // added because the bubble can land anywhere on a real page; see file
  // header). ──
  #applyPosition() {
    const rect = this.#trigger.getBoundingClientRect()
    const offset = Math.max(0, Number(this.getAttribute('offset') ?? 10) || 0)
    const preferred = this.getAttribute('placement') || 'top'
    const bw = this.#box.offsetWidth || 0
    const bh = this.#box.offsetHeight || 0
    const placement = this.#resolvePlacement(preferred, rect, bw, bh, offset)
    this.#applyPlacementClass(placement)

    const p = this.#anchorPoint(rect, placement)
    let tx = '-50%',
      ty = '-100%',
      mx = 0,
      my = -offset
    if (placement === 'bottom') {
      ty = '0'
      my = offset
    } else if (placement === 'left') {
      tx = '-100%'
      ty = '-50%'
      mx = -offset
      my = 0
    } else if (placement === 'right') {
      tx = '0'
      ty = '-50%'
      mx = offset
      my = 0
    }
    this.#box.parentElement.style.transform = `translate(${p.x + mx}px, ${p.y + my}px) translate(${tx}, ${ty})`
  }

  #applyPlacementClass(placement) {
    if (this.#curPlacement === placement) return
    if (this.#curPlacement) {
      this.#box.classList.remove(`vstip-host__box--${this.#curPlacement}`)
      this.#arrowEl.classList.remove(`vstip-host__arrow--${this.#curPlacement}`)
    }
    this.#box.classList.add(`vstip-host__box--${placement}`)
    this.#arrowEl.classList.add(`vstip-host__arrow--${placement}`)
    this.#curPlacement = placement
  }

  #anchorPoint(rect, placement) {
    switch (placement) {
      case 'bottom':
        return { x: rect.left + rect.width / 2, y: rect.bottom }
      case 'left':
        return { x: rect.left, y: rect.top + rect.height / 2 }
      case 'right':
        return { x: rect.right, y: rect.top + rect.height / 2 }
      case 'top':
      default:
        return { x: rect.left + rect.width / 2, y: rect.top }
    }
  }

  /** preferred side if it fits in the viewport, else its opposite, else preferred anyway */
  #resolvePlacement(preferred, rect, bw, bh, offset) {
    const vw = innerWidth,
      vh = innerHeight
    const fits = {
      top: rect.top - offset - bh >= 0,
      bottom: rect.bottom + offset + bh <= vh,
      left: rect.left - offset - bw >= 0,
      right: rect.right + offset + bw <= vw,
    }
    if (fits[preferred]) return preferred
    const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }
    if (fits[opposite[preferred]]) return opposite[preferred]
    return preferred
  }

  #sync() {
    const content = this.getAttribute('content') ?? 'Tooltip'
    // reflect content/variant/radius even while hidden so a hover shows the
    // right thing on the FIRST frame (no flash of stale text)
    if (content !== this.#lastContent && !this.#visible) {
      this.#lastContent = content
      this.#content.innerHTML = content
    }
    this.#applyVariant()
    // seed a placement class before the first show (cosmetic only — the
    // real, viewport-aware placement is resolved in #applyPosition at show
    // time); skip while open so an attribute change never yanks the bubble
    // mid-animation without going through the resolve+reposition path.
    if (!this.#visible) this.#applyPlacementClass(this.getAttribute('placement') || 'top')
  }
}
customElements.define('vs-tooltip', VsTooltip)
