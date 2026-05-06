# Kwatmi's Studio Design Language

> A Nigerian ride-hailing experience built for speed, trust, and local reality.

---

## Identity

**Personality:** Swift · Trustworthy · Grounded

**Philosophy:** "Move with confidence." Kwatmi exists to bring reliable, dignified transportation to every Nigerian — whether on the back of an okada or inside a keke. We design for the chaos of Lagos traffic and the patience of Abuja roundabouts. Every pixel earns its place.

**Voice:** Direct and warm. We speak like a trusted friend who knows the streets — no corporate fluff, no condescension. We use Naira, not dollars. We say "Dey go" not "Let's ride."

---

## Colors

### Primary Palette

| Name | Hex | CSS Var | Usage |
|------|-----|---------|-------|
| **Kwatmi Green** | `#00A86B` | `--color-brand-primary` | Primary CTAs, active states, success indicators |
| **Green Light** | `#00C77B` | `--color-brand-primary-light` | Hover states, highlights |
| **Green Dark** | `#008F5B` | `--color-brand-primary-dark` | Pressed states, emphasis |
| **Green Muted** | `rgba(0,168,107,0.15)` | `--color-brand-primary-muted` | Backgrounds, subtle highlights |
| **Lagos Gold** | `#F5A623` | `--color-accent-gold` | Ratings, premium badges, warnings |
| **Gold Light** | `#FFB84D` | `--color-accent-gold-light` | Gold hover state |

### Semantic Colors

| Name | Hex | CSS Var | Usage |
|------|-----|---------|-------|
| Success | `#00A86B` | `--color-semantic-success` | Confirmations, completed states |
| Warning | `#F5A623` | `--color-semantic-warning` | Alerts, surge pricing |
| Error | `#E53935` | `--color-semantic-error` | Errors, cancellations |
| Info | `#2196F3` | `--color-semantic-info` | Tips, informational banners |

### Neutral Scale

| Shade | Hex | CSS Var | Usage |
|-------|-----|---------|-------|
| Gray 950 | `#0A0A0A` | `--color-gray-950` | Deepest background |
| Gray 900 | `#121212` | `--color-gray-900` | Primary background |
| Gray 850 | `#1A1A1A` | `--color-gray-850` | Elevated surfaces |
| Gray 800 | `#242424` | `--color-gray-800` | Cards, containers |
| Gray 700 | `#333333` | `--color-gray-700` | Borders, dividers |
| Gray 600 | `#4D4D4D` | `--color-gray-600` | Disabled text |
| Gray 500 | `#666666` | `--color-gray-500` | Tertiary text |
| Gray 400 | `#808080` | `--color-gray-400` | Placeholder text |
| Gray 300 | `#A3A3A3` | `--color-gray-300` | Secondary text |
| Gray 200 | `#C4C4C4` | `--color-gray-200` | Subtle text |
| Gray 100 | `#E5E5E5` | `--color-gray-100` | Light borders |
| Gray 50 | `#F5F5F5` | `--color-gray-50` | Primary text (on dark) |

---

## Typography

**Font Stack:**
- Sans: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Mono: `JetBrains Mono, SF Mono, Fira Code, monospace`

### Type Scale

| Style | Size | Line Height | Letter Spacing | Weight | Use Case |
|-------|------|-------------|----------------|--------|----------|
| **Display XL** | 3.5rem (56px) | 1.1 | -0.03em | 700 | Hero splash, onboarding |
| **Display LG** | 2.5rem (40px) | 1.15 | -0.025em | 700 | Section heroes |
| **Display MD** | 2rem (32px) | 1.2 | -0.02em | 600 | Modal titles, large fares |
| **Heading LG** | 1.5rem (24px) | 1.3 | -0.015em | 600 | Screen titles |
| **Heading MD** | 1.25rem (20px) | 1.35 | -0.01em | 600 | Card headers, driver names |
| **Heading SM** | 1.125rem (18px) | 1.4 | -0.01em | 600 | Subheadings |
| **Body LG** | 1rem (16px) | 1.6 | 0 | 400 | Primary content |
| **Body MD** | 0.875rem (14px) | 1.5 | 0 | 400 | Default body text |
| **Body SM** | 0.8125rem (13px) | 1.5 | 0 | 400 | Secondary content |
| **Label** | 0.75rem (12px) | 1.4 | 0.02em | 500 | Input labels, badges |
| **Caption** | 0.6875rem (11px) | 1.4 | 0.02em | 400 | Timestamps, legal text |

---

## Spacing

**Base Unit:** 4px grid

| Token | Value | CSS Var | Common Use |
|-------|-------|---------|------------|
| `xs` | 4px | `--spacing-xs` | Icon padding, tight gaps |
| `sm` | 8px | `--spacing-sm` | Button padding, list gaps |
| `md` | 16px | `--spacing-md` | Card padding, section gaps |
| `lg` | 24px | `--spacing-lg` | Screen padding, major gaps |
| `xl` | 32px | `--spacing-xl` | Section spacing |
| `2xl` | 48px | `--spacing-2xl` | Large section breaks |
| `3xl` | 64px | `--spacing-3xl` | Hero spacing |
| `4xl` | 96px | `--spacing-4xl` | Major layout gaps |
| `5xl` | 128px | `--spacing-5xl` | Full-page breathing room |

### Component Spacing Presets

- **Card Padding:** 16px (`--spacing-md`)
- **Section Gap:** 32px (`--spacing-xl`)
- **Input Padding:** 8px vertical, 16px horizontal
- **Button Padding:** 12px vertical, 24px horizontal
- **Screen Edge Margin:** 16px

---

## Border Radius

| Token | Value | CSS Var | Use Case |
|-------|-------|---------|----------|
| `sm` | 4px | `--radius-sm` | Subtle rounding, tags |
| `md` | 8px | `--radius-md` | Inputs, small buttons |
| `lg` | 12px | `--radius-lg` | Primary buttons, chips |
| `xl` | 16px | `--radius-xl` | Cards, modals |
| `2xl` | 24px | `--radius-2xl` | Bottom sheets |
| `full` | 9999px | `--radius-full` | Pills, avatars, FABs |

### Component Defaults

- **Buttons:** 12px (`--radius-lg`)
- **Cards:** 16px (`--radius-xl`)
- **Inputs:** 8px (`--radius-md`)
- **Chips/Tags:** 9999px (`--radius-full`)
- **Avatars:** 9999px (`--radius-full`)

---

## Motion

### Duration

| Token | Value | CSS Var | Use Case |
|-------|-------|---------|----------|
| `fast` | 150ms | `--duration-fast` | Micro-interactions, toggles, color changes |
| `normal` | 250ms | `--duration-normal` | Standard transitions, cards, modals |
| `slow` | 400ms | `--duration-slow` | Page transitions, complex animations |
| `slower` | 600ms | `--duration-slower` | Celebratory moments, onboarding |

### Easing

| Token | Value | Use Case |
|-------|-------|----------|
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Exit animations, most UI transitions |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Symmetrical animations, loaders |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful bounces, button presses |
| `bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Attention-grabbing, celebrations |

### Animation Guidelines

1. **Map pin drops:** `spring` easing, 400ms
2. **Bottom sheet slides:** `ease-out`, 300ms
3. **Button press feedback:** `spring`, 150ms scale to 0.97
4. **Loading pulse:** `ease-in-out`, 1200ms infinite
5. **Success checkmark:** `bounce`, 500ms with slight delay

---

## Design Principles

### 1. Dark by Default
Nigerian riders often travel at night and use phones in bright sunlight. Our dark theme reduces eye strain, saves battery on OLED screens, and makes the green brand color pop with authority. Light mode is secondary.

### 2. Naira-First Clarity
Money is never hidden. Fares show upfront in bold, unmistakable Nigerian Naira (₦). No currency conversion confusion, no surprise charges. Cash is king, so "Pay with Cash" is always the default payment option.

### 3. Respect the Network
Design for 2G/3G realities. Every screen must be usable with slow connections. Optimistic UI updates, skeleton loaders, and offline states aren't edge cases — they're the baseline. Images are lazy-loaded and compressed.

### 4. Local Vehicle Hierarchy
Okada and Keke aren't afterthoughts — they're primary transport modes. UI treats them with equal dignity to cars. Vehicle illustrations are distinctly Nigerian, not generic sedan silhouettes.

---

## Elevation & Shadows

| Level | CSS Var | Use Case |
|-------|---------|----------|
| `sm` | `--shadow-sm` | Subtle cards, inputs |
| `md` | `--shadow-md` | Elevated cards, dropdowns |
| `lg` | `--shadow-lg` | Modals, bottom sheets |
| `xl` | `--shadow-xl` | Full-screen overlays |
| `glow-brand` | `--shadow-glow-brand` | Primary CTA emphasis |

---

## Z-Index Scale

| Layer | Value | Use Case |
|-------|-------|----------|
| Base | 0 | Default content |
| Dropdown | 100 | Menus, popovers |
| Sticky | 200 | Sticky headers, FABs |
| Overlay | 300 | Background overlays |
| Modal | 400 | Modals, dialogs |
| Toast | 500 | Notifications |
| Tooltip | 600 | Tooltips (topmost) |

---

## Mobile-Specific Guidelines (360px Android)

- **Safe areas:** Respect 16px horizontal margins
- **Touch targets:** Minimum 48×48px tap areas
- **Bottom sheet handles:** 4px height, 32px width, centered
- **Map UI:** Pin centered slightly above screen middle (40% from top)
- **Keyboard avoidance:** Inputs scroll into view with 16px buffer

---

## Usage Examples

```css
/* Primary CTA Button */
.btn-primary {
  background: var(--color-brand-primary);
  color: var(--color-gray-950);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-button);
  font-size: var(--font-size-body-md);
  font-weight: 600;
  transition: var(--transition-colors);
}

.btn-primary:active {
  background: var(--color-brand-primary-dark);
  transform: scale(0.97);
  transition: var(--transition-transform);
}

/* Ride Option Card */
.ride-card {
  background: var(--color-surface-card);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-card);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.ride-card.selected {
  border-color: var(--color-brand-primary);
  box-shadow: var(--shadow-glow-brand);
}
```

---

**Version:** 1.0.0  
**Last Updated:** Sprint 1  
**Maintained by:** Kwatmi's Studio Design Team