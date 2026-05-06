# Kwatmi Design Language

> The visual identity system for Nigeria's modern ride-hailing experience.

---

## Identity

**Personality:** Bold, Trustworthy, Vibrant

**Philosophy:** Kwatmi brings the energy of Nigerian movement — fast, reliable, and unmistakably local. Every pixel serves riders navigating Lagos traffic under the afternoon sun.

**Voice:** Direct and confident. We speak like a friend who knows the streets — no unnecessary words, just clear guidance that gets you where you need to go.

---

## Colors

### Brand Palette

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Go Green | `#00B140` | `--color-go-green` | Primary actions, success states, brand identity |
| Go Green Light | `#4ADE80` | `--color-go-green-light` | Hover states, highlights, active indicators |
| Go Green Dark | `#15803D` | `--color-go-green-dark` | Pressed states, emphasis |
| Naija Gold | `#F59E0B` | `--color-naija-gold` | Promotions, warnings, premium features |
| Alert Red | `#EF4444` | `--color-alert-red` | Errors, cancellations, urgent alerts |
| Trust Blue | `#3B82F6` | `--color-trust-blue` | Information, links, secondary actions |
| Surface Dark | `#0A0F0D` | `--color-surface-dark` | Primary background |
| Surface Elevated | `#141A17` | `--color-surface-elevated` | Cards, modals, elevated surfaces |

### Neutral Scale

| Shade | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| 950 | `#0A0F0D` | `--color-neutral-950` | Primary background |
| 900 | `#141A17` | `--color-neutral-900` | Secondary background |
| 800 | `#1F2923` | `--color-neutral-800` | Subtle borders |
| 700 | `#2D3B33` | `--color-neutral-700` | Default borders |
| 600 | `#3D5147` | `--color-neutral-600` | Strong borders |
| 500 | `#5E7A6D` | `--color-neutral-500` | Muted text |
| 400 | `#8BA498` | `--color-neutral-400` | Secondary text |
| 300 | `#B8CABE` | `--color-neutral-300` | Placeholder text |
| 200 | `#D9E5DC` | `--color-neutral-200` | Disabled text |
| 100 | `#ECF2EE` | `--color-neutral-100` | Light backgrounds |
| 50 | `#F7FAF8` | `--color-neutral-50` | Primary text, pure surface |

---

## Typography

**Primary Font:** Inter  
**Monospace Font:** JetBrains Mono

| Style | Size | Line Height | Letter Spacing | Weight | Family |
|-------|------|-------------|----------------|--------|--------|
| Display XL | 3.5rem (56px) | 1.1 | -0.03em | 700 | Inter |
| Display LG | 2.75rem (44px) | 1.15 | -0.025em | 700 | Inter |
| Display MD | 2.25rem (36px) | 1.2 | -0.02em | 600 | Inter |
| Heading LG | 1.75rem (28px) | 1.25 | -0.015em | 600 | Inter |
| Heading MD | 1.375rem (22px) | 1.3 | -0.01em | 600 | Inter |
| Heading SM | 1.125rem (18px) | 1.35 | -0.005em | 600 | Inter |
| Body LG | 1.125rem (18px) | 1.6 | 0em | 400 | Inter |
| Body MD | 1rem (16px) | 1.6 | 0em | 400 | Inter |
| Body SM | 0.9375rem (15px) | 1.5 | 0em | 400 | Inter |
| Label | 0.9375rem (15px) | 1.2 | 0.01em | 500 | Inter |
| Caption | 0.8125rem (13px) | 1.4 | 0.01em | 400 | Inter |

### Typography Guidelines

- **Minimum mobile text:** 16px (Body MD) for readability in bright sunlight
- **Price displays:** Use Heading MD or larger, always bold
- **Button text:** Label style, never smaller than 15px
- **Monospace:** Use for OTP inputs, ride codes, and fare breakdowns

---

## Spacing

**Base Unit:** 4px

| Token | Value | CSS Variable | Usage |
|-------|-------|--------------|-------|
| xs | 4px | `--spacing-xs` | Tight element gaps, icon padding |
| sm | 8px | `--spacing-sm` | Inline spacing, form gaps |
| md | 16px | `--spacing-md` | Standard padding, card internal |
| lg | 24px | `--spacing-lg` | Section spacing, card gaps |
| xl | 32px | `--spacing-xl` | Major section breaks |
| 2xl | 48px | `--spacing-2xl` | Page section gaps |
| 3xl | 64px | `--spacing-3xl` | Hero spacing |
| 4xl | 96px | `--spacing-4xl` | Major layout gaps |
| 5xl | 128px | `--spacing-5xl` | Maximum section spacing |

### Touch Target Requirements

- **Minimum touch target:** 48px × 48px
- **Recommended button height:** 48-56px
- **Tap area padding:** Extend clickable area beyond visual bounds

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 4px | Small badges, tags |
| md | 8px | Inputs, small cards |
| lg | 12px | Buttons, medium cards |
| xl | 16px | Large cards, modals |
| 2xl | 24px | Feature cards, hero elements |
| full | 9999px | Pills, avatars, circular buttons |

### Component-Specific Radii

- **Buttons:** 12px (lg) — friendly but purposeful
- **Cards:** 16px (xl) — approachable containers
- **Inputs:** 8px (md) — subtle, focused
- **Avatars:** Full — always circular
- **Status badges:** Full — pill-shaped

---

## Motion

### Duration

| Token | Value | Usage |
|-------|-------|-------|
| instant | 50ms | Color changes, micro-feedback |
| fast | 150ms | Button presses, toggles, hovers |
| normal | 250ms | Panel transitions, fades |
| slow | 400ms | Page transitions, modals |
| slower | 600ms | Complex animations, onboarding |

### Easing

| Token | Curve | Usage |
|-------|-------|-------|
| ease-out | `cubic-bezier(0.16, 1, 0.3, 1)` | Most UI transitions |
| ease-in-out | `cubic-bezier(0.65, 0, 0.35, 1)` | Bi-directional movement |
| spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful bounces, confirmations |

### Motion Guidelines

- **Button feedback:** fast + ease-out
- **Modal entrance:** normal + ease-out
- **Success animations:** normal + spring
- **Reduced motion:** Respect `prefers-reduced-motion`

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| sm | `0 1px 2px rgba(0,0,0,0.4)` | Subtle lift, inputs |
| md | `0 4px 8px rgba(0,0,0,0.5)` | Cards, dropdowns |
| lg | `0 12px 24px rgba(0,0,0,0.6)` | Modals, popovers |
| xl | `0 24px 48px rgba(0,0,0,0.7)` | Hero elements |
| glow-green | `0 0 24px rgba(0,177,64,0.4)` | Active states, CTAs |
| glow-gold | `0 0 24px rgba(245,158,11,0.4)` | Promotions, premium |

---

## Design Principles

### 1. Sunlight-Ready Contrast

Every color combination must remain legible under direct Lagos sunlight. Dark backgrounds with bright text, never subtle grays on white. Test everything outdoors.

### 2. Thumb-First Interaction

Primary actions live in the thumb zone. Every button, every swipe target is sized for one-handed use while standing in a moving vehicle. 48px minimum, no exceptions.

### 3. Connection-Resilient Design

Assume the network is unreliable. Show optimistic states, provide offline feedback, and design loading states that feel intentional rather than broken. Every screen should be useful even when data is slow.

### 4. Go Green Energy

The Go Green color isn't just a brand choice — it's a signal of action. When users see green, something is happening, moving, confirmed. Reserve it for primary CTAs and success states only.

---

## Usage Examples

### Button Hierarchy

```css
/* Primary CTA */
.btn-primary {
  background: var(--color-go-green);
  color: var(--color-neutral-950);
  min-height: var(--spacing-touch-min);
  border-radius: var(--radius-button);
  font: var(--text-label-weight) var(--text-label-size) var(--font-sans);
}

/* Secondary */
.btn-secondary {
  background: transparent;
  border: 1px solid var(--color-border-default);
  color: var(--color-text-primary);
}

/* Loading State */
.btn-loading {
  background: var(--color-neutral-700);
  pointer-events: none;
}
```

### Card Component

```css
.card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-card);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}
```

### Status Indicators

```css
.status-searching { color: var(--color-naija-gold); }
.status-confirmed { color: var(--color-go-green); }
.status-cancelled { color: var(--color-alert-red); }
.status-completed { color: var(--color-trust-blue); }
```

---

## Accessibility

- **Contrast ratio:** Minimum 4.5:1 for body text, 3:1 for large text
- **Focus indicators:** 2px Go Green outline on all interactive elements
- **Touch targets:** 48px minimum in all directions
- **Reduced motion:** Honor system preferences
- **Screen reader:** All icons paired with labels or aria-label

---

*Last updated: Sprint 1*  
*Maintained by: Kwatmi Design Team*