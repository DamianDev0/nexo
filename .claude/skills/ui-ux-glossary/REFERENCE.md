===== ACCORDION =====
Vertical stack of collapsible containers. When: organizing large content (FAQs, settings), progressive disclosure to reduce cognitive load, limited screen space. Not: minimal content (inline better), frequently accessed content (tabs/lists better), critical info that must stay visible.

===== ACTION-SHEET =====
Menu overlay presenting actions (iOS origin). Destructive actions in red. Not connected to screen edges (vs bottom sheet). When: quick actions (share/delete), 3-5 choices. Not: multi-step interactions, >5 options.

===== AVATAR =====
Representation of unique entity (person/business/object): initials, emoji, photo, icon, logo. Supports badging (Badge or Status Dot) for extra info.

===== BADGE =====
Conveys dynamic info: counts or status. Supplementary, attached to parent element, usually static/non-interactive. When: unread counts, highlighting ("New", "Sale"), compact status. Not: detailed content (labels/tooltips instead), overuse (reduces impact), critical info (use modal/alert).

===== BANNER =====
Prominent message + related actions, persistent until dismissed/resolved. Only ONE banner at a time. CTA optional. When: temporary announcements, contextual feedback (form errors, cookie consent), visible-but-not-disruptive info. Not: permanent content (headers/sections), critical alerts (modal), stacking multiple.

===== BOTTOM-SHEET =====
Supplementary content anchored bottom, full width, elevated. Drag handle for resize/snap points. Modal (overlay, blocks interaction — critical/focused tasks) vs non-modal (background stays interactive). When: supplementary content, briefly needed info, contextual actions. Not: primary tasks needing full attention, complex tasks needing space, frequent toggling with background.

===== BUTTON =====
Labels express the action. Axes: importance (primary/secondary/tertiary/destructive), state (default/disabled), size. When: triggering actions, clear single actions (Submit/Save/Next), guiding to action. Not: static info (text/label), many complex options (dropdown/menu), too many buttons close together (use icons/links).

===== CARD =====
Groups related content+actions into visually distinct unit. Static or clickable; alone or grid/list/carousel. When: bundling related info, interactive exploration, collections/grids of similar content. Not: minimal content (list/plain text), highly complex content (dedicated page/panel), repetitive layouts (simpler sections/tables).

===== CAROUSEL =====
Horizontally scrollable series; optional arrow controls. When: showcasing collections, limited space, visual storytelling. Not: critical content (hidden items get missed).

===== CHECKBOX =====
Input control, one-or-more selection; states checked/empty/mixed. When: multiple selections, persistent visible choices, independent enable/disable options. Not: single selection (radio), binary on/off action (switch), choices needing explanation (dropdown/wizard).
===== CHIP =====
Compact pill: input, attribute, or action. Short text, interactive, grouped (rarely standalone). When: tags/categories/filters, multiple selections, compact dismissible info. Not: complex actions, too many chips (clutter), primary actions needing prominence.

===== COLOR-PICKER =====
Select colors from spectrum or palette. 4 variants: color palette (swatches), color slider, color wheel, color area. When: customization/personalization, creative tools with precise selection. Not: few preset colors (dropdown/radio/swatches instead), exact codes (offer hex input); predefined swatches keep consistency.

===== COMBOBOX =====
Searchable dropdown with autocomplete filter over predefined options; editable variant allows new entries (tags, cities). When: long searchable lists, input with suggestions, saving space. Not: few fixed options (radio/dropdown), complex multi-field entry.

===== COMMAND-PALETTE =====
Quick access to commands via CMD+K style search. When: many actions/shortcuts, power users, too many features to surface in UI. Not: few commands, infrequent advanced usage.

===== CONTEXT-MENU =====
Right-click (web) / long-press (mobile) menu on an element; non-modal overlay. When: secondary per-element actions (delete/rename/download), saving space. Not: primary/frequent actions (button/toolbar), unintuitive triggers users won't discover.

===== DATE-PICKER =====
Single date or range; variants calendar, wheels, day lists, toggles, tiles. When: flexible/precise date selection, minimizing format errors. Not: few valid dates (dropdown), manual typing preferred (birthdate), cramped small screens.

===== DIALOG =====
Layer above page requiring interaction; focuses attention on single-step task. When: critical decisions/confirmations (delete, logout), required acknowledgment, short self-contained tasks. Not: minor feedback (toast/banner), non-blocking info (inline/tooltip), multi-step workflows (page/wizard).

===== DIVIDER =====
Thin line grouping content. Enhances negative space; needs proper spacing around it. When: visual separation for readability, grouping related items, hierarchy. Not: overuse (noise), minimal content (feels fragmented).

===== DRAWER =====
Edge panel (left/right/top), modal or non-modal. When: secondary actions (settings, nav links), limited screen space. Not: frequent primary actions (buttons/tabs), discoverability-critical features, frequent section switching (tabs/bottom bar).

===== DROPDOWN-MENU =====
Trigger-anchored temporary list of actions/options. When: multiple options in compact layout, secondary/infrequent actions. Not: high-discoverability needs (tabs), frequently accessed actions (button).
===== EMPTY-STATE =====
No-data screen prompting action. Types: first-time use, no-results (search/filter), post-completion (delight), feature education. Always give message + visual cue + action; dead ends kill activation.

===== ERROR-MESSAGE =====
Dos: clear + specific + suggest solution ("File limit exceeded. Upload <5MB"); visible cues (red borders, icons, banner/toast/dialog); polite direct copy. Don'ts: jargon/vague ("error code 500"), interrupt workflow unless truly necessary.

===== FILE-UPLOADER =====
Drop zone + button. When: uploading files/media, need visual drop target, multiple files. Not: tight/mobile layouts (drag hard), infrequent use (plain button suffices).

===== FLOATING-ACTION-BUTTON =====
Primary screen action, max z-index. When: important CTAs, constructive actions (create/share/favorite). Not: minor actions, destructive actions.

===== FULL-SCREEN-OVERLAY =====
Fills screen; dismissed only by completing or explicit X (hiding X = dark pattern). When: focused immersive tasks (onboarding, paywall), isolating from background. Not: quick/minor tasks, disrupting main flow, frequent background switching.

===== GALLERY =====
Grid of visual items (uniform/masonry/quilted). When: media collections, browsing experience, visual-first content. Not: 1-2 items (standalone), text/data-heavy (table/list).

===== HYPERLINK =====
Navigation between locations; default blue underlined (contrast/accessibility). When: external content, supplementary "Learn more". Not: critical actions (button), when visual emphasis needed.

===== LAUNCH-SCREEN =====
First screen at app launch. Dos: simple, brand-focused, fast, optional animation. Don'ts: info overload, skipping device testing.

===== LOADING-INDICATOR =====
Determinate (known progress → %) vs indeterminate (unknown). Optional label for context; brandable. When: long tasks, feedback needed, unknown durations. Not: <1s tasks, frequent short tasks, distraction risk.

===== MAP-PIN =====
Point on map; dot or custom brand icon. When: marking locations, interactive pins (tap → popover), exploration. Not: dense clusters (cluster them), decorative static maps.

===== NAVIGATION-MENU =====
Primary nav links in fly-out overlay. Variants: navigation menu (simple top-level), mega menu (complex hierarchy), vertical sidebar (small screens/mobile).

===== PAGE-CONTROL =====
Indicator dots for flat page list; filled dot = current. When: swipe navigation (onboarding, carousels), 3-7 pages, simple linear progress. Not: non-linear jumping (tabs/lists), large datasets (pagination).
===== PAGINATION =====
Navigate between pages of content. Visible next/prev + page numbers, highlight current page. Chunk 10-50 items/page. Infinite scroll for feeds/visual grids instead. When: large datasets, predictable navigation, jumping to sections. Not: small datasets (static list), continuous browsing.

===== POPOVER =====
Contextual overlay floating around trigger; esc to close. Saves space for non-essential contextual info. When: supplementary info (profile previews), temporary dismissible content (filters), context-specific actions (text formatting). Not: critical info/actions (modal/dialog), frequently accessed content.

===== PROGRESS-INDICATOR =====
Visual feedback of task status. Determinate (known duration → %; uploads) vs indeterminate (unknown; spinner). When: long tasks, multi-step processes (guide users), reassurance. Not: short/instant/single-step tasks.

===== RADIO-BUTTON =====
Single choice from mutually exclusive visible options. When: exclusive options, clear labels with space, all options visible at once. Not: binary (switch/checkbox), many options (dropdown), dependent/complex selections.

===== SEARCH-BAR =====
Keyword search. Levels: global (whole app), page, component (e.g. table). When: large datasets, search as primary action. Not: minimal browsable content (5-10 items).

===== SEGMENTED-CONTROL =====
Toggle to switch views or select options; 2+ segments on a track. When: few mutually exclusive options (list/grid view), instant switching, equal importance. Not: many options (dropdown), hierarchical choices.

===== SELECT =====
Dropdown choice; shows selected value when closed. When: limited defined list (country/language), simple single choice. Not: >10 options (combobox), multiple selections (checkboxes).

===== SIDEBAR =====
Navigation panel; reduces cognitive load by hiding non-core features. When: complex apps with many sections, infrequent screens (settings/profile/help). Not: simple navigation, frequent destinations (tab bar instead).

===== SKELETON =====
Placeholder preview mimicking layout while loading; shimmer animation; better perceived performance than blank/spinner. When: fetching content, content-rich pages. Not: near-instant loads, simple layouts.

===== SLIDER =====
Selection from a range. Discrete (predefined steps, shows values) vs continuous (any value, smooth). When: adjustable values (volume), quick comparisons. Not: precise exact inputs (use text/number), many distinct options.

===== STACKED-LIST =====
Vertical list of related content (text+images); preferred over tables on mobile (no dual-axis scroll). When: ordered flow (tasks, results), concise per-item info, scannable single column. Not: multi-column data (table), content-heavy items (accordion).

===== STATUS-DOT =====
Small circle conveying binary status; static, non-interactive; color-coded. When: real-time presence (online), binary states, compact space. Not: detailed info (badge/label), multiple statuses (icon+text/tooltip), critical alerts (modal).
===== STEPPER =====
Two-segment +/- control for incremental values. When: small precise increments (quantity), preventing invalid inputs, low cognitive load (1-10). Not: large/arbitrary ranges (text field/slider), fast scanning of many values, tight layouts.

===== SWITCH =====
On/off toggle; active = accent background, inactive = grey. Effect must be immediate. When: instant changes, binary states, clear effect. Not: actions needing confirmation/steps, non-binary options (radio/dropdown), unclear effects (use button+label).

===== TAB-BAR =====
Bottom navigation for top-level destinations; 2-6 items, never >5 advisable — each extra tab adds complexity. More nav → drawer/hamburger. When: core sections (Home/Search/Profile), always-available navigation, mobile-first.

===== TABLE =====
Scan/sort/compare structured data; sortable columns, filters, pagination. When: structured categories, side-by-side comparison, consistent formatting. Not: few data points (list/text), relationship data (charts), mobile (dual-axis scroll — use stacked list).

===== TABLE-OF-CONTENTS =====
Jump navigation over page sections with H1/H2/H3 hierarchy. When: long multi-section content, non-linear jumping. Not: short content, strictly sequential reading.

===== TEXT-AREA =====
Multi-line input (can grow from a text field, e.g. Slack). When: detailed free-form input (comments, descriptions), multi-line editing. Not: short single-line responses (text field), constrained layouts, static display.

===== TEXT-FIELD =====
Single-line input; pair with label, helper text, placeholder, inline validation as needed. When: user-generated input, short specific data (phone, address), flexible formats. Not: predefined choices (dropdown/radio/checkbox), long text (text area), no-input actions.

===== TILE =====
Radio/checkbox styled with icon or image; selection shown via filled background or outlined border + selection icon. When: visual option selection (colors, product variants, sectors), single or multi-select. Not: too many options (dropdown), tight space (compact list).

===== TIME-PICKER =====
Variants: scroll wheel, clock dial, select options. When: precise times, enforced format (24h/AM-PM). Not: broad periods ("morning" → radio), faster typed entry, start+end in one step (range picker).

===== TOAST =====
Brief auto-dismissing message; noticed without disrupting. When: low-priority notifications, optional actions, self-dismissing acknowledgments. Not: high-priority (dialog), urgent actions (dialog/banner), persistent messages (banner).

===== TOOLBAR =====
Contextual group of icon/text buttons for the current task. Overflow non-essential actions into an action menu. When: frequent actions in reachable spot, contextual functions, space efficiency. Not: too many actions (clutter), rarely used actions (action options menu).

===== TOOLTIP =====
Contextual text label on hover (web) / tap on info icon (mobile). When: brief context for a feature, explaining unfamiliar terms/icons, onboarding nudges. Not: content needing full attention (dialog), frequently revisited content, essential info (put it on the page).

===== TOP-NAVIGATION-BAR =====
Header with navigation + actions (back, search, cart). When: branding/titles, essential simple actions, compact content. Not: primary section switching (tab bar), infrequent actions (cognitive overload), vertical-space-hungry content.

===== TREE =====
Hierarchical nodes; parent/child usually with distinct icons + text; checkboxes for bulk actions; collapsible threads (Reddit-style). When: hierarchical navigation (files/folders), bulk selection over hierarchy, threaded conversations.
