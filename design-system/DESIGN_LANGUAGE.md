# Kwatmi Design Language

> Mobile-first ride-sharing design system optimized for Nigerian market conditions

---

## Identity

**Personality:** Bold, Trustworthy, Swift

**Philosophy:** Kwatmi moves Lagos. Our design puts riders and drivers in control with high-visibility interfaces that work in bright sunlight, low-bandwidth conditions, and the beautiful chaos of Nigerian streets.

**Voice:** Direct, confident, locally relevant. We speak plainly — no fluff, just clear information when you need to make fast decisions.

---

## Colors

### Primary Palette

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Go Green | `#00C853` | `--color-go-green` | Primary actions, confirmations, success states, "Book Ride" CTAs |
| Go Green Light | `#69F0AE` | `--color-go-green-light` | Hover states, success backgrounds |
| Go Green Dark | `#00A344` | `--color-go-green-dark` | Pressed states, high-contrast text on light |
| Lagos Gold | `#FFB300` | `--color-lagos-gold` | Warnings, premium features, fare displays |
| Lagos Gold Light | `#FFE082` | `--color-lagos-gold-light` | Warning backgrounds |
| Lagos Gold Dark | `#FF8F00` | `--color-lagos-gold-dark` | Urgent warnings |
| Okada Orange | `#FF6D00` | `--color-okada-orange` | Motorcycle ride type indicator |
| Keke Yellow | `#FFC400` | `--color-keke-yellow` | Tricycle ride type indicator |
| Alert Red | `#FF3D00` | `--color-alert-red` | Errors, cancellations, critical alerts |
| Sky Blue | `#00B0FF` | `--color-sky-blue` | Links, info states, secondary CTAs |

### Neutral Scale

| Shade | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| 950 | `#0A0A0B` | `--color-neutral-950` | Primary background (dark mode) |
| 900 | `#121214` | `--color-neutral-900` | Secondary background, cards |
| 800 | `#1E1E21` | `--color-neutral-800` | Tertiary background, inputs |
| 700 | `#2C2C31` | `--color-neutral-700` | Elevated surfaces, borders |
| 600 | `#3D3D44` | `--color-neutral-600` | Disabled states |
| 500 | `#5C5C66` | `--color-neutral-500` | Placeholder text |
| 400 | `#8A8A96` | `--color-neutral-400` | Secondary icons |
| 300 | `#B3B3BD` | `--color-neutral-300` | Secondary text |
| 200 | `#D4D4DB` | `--color-neutral-200` | Dividers (light mode) |
| 100 | `#EBEBF0` | `--color-neutral-100` | Backgrounds (light mode) |
| 50 | `#F7F7F9` | `--color-neutral-50` | Primary background (light mode) |

---

## Typography

**Font Families:**
- Sans: Inter (system fallbacks)
- Mono: JetBrains Mono (for prices, codes)

### Type Scale

| Style | Size | Line Height | Letter Spacing | Weight | Usage |
|-------|------|-------------|----------------|--------|-------|
| Display XL | 3rem (48px) | 1.1 | -0.03em | 700 | Splash screens, hero moments |
| Display LG | 2.25rem (36px) | 1.15 | -0.025em | 700 | Section heroes |
| Display MD | 1.75rem (28px) | 1.2 | -0.02em | 600 | Page titles, modals |
| Heading LG | 1.375rem (22px) | 1.3 | -0.015em | 600 | Card headers |
| Heading MD | 1.125rem (18px) | 1.35 | -0.01em | 600 | Subsections |
| Heading SM | 1rem (16px) | 1.4 | 0 | 600 | List headers |
| Body LG | 1.125rem (18px) | 1.5 | 0 | 400 | Primary content, outdoor readable |
| Body MD | 1rem (16px) | 1.5 | 0 | 400 | Secondary content |
| Body SM | 0.875rem (14px) | 1.5 | 0 | 400 | Tertiary content |
| Label | 0.875rem (14px) | 1.4 | 0.01em | 500 | Buttons, form labels |
| Caption | 0.75rem (12px) | 1.4 | 0.02em | 400 | Timestamps, meta info |

---

## Spacing

**Base Unit:** 4px

| Token | Value | CSS Variable | Usage |
|-------|-------|--------------|-------|
| xs | 4px | `--spacing-xs` | Tight gaps, icon padding |
| sm | 8px | `--spacing-sm` | Small gaps, inline spacing |
| md | 16px | `--spacing-md` | Default padding, card gutters |
| lg | 24px | `--spacing-lg` | Section padding |
| xl | 32px | `--spacing-xl` | Large sections |
| 2xl | 48px | `--spacing-2xl` | Major sections |
| 3xl | 64px | `--spacing-3xl` | Page margins |
| 4xl | 96px | `--spacing-4xl` | Hero spacing |
| 5xl | 128px | `--spacing-5xl` | Maximum spacing |

### Touch Targets

| Token | Value | Usage |
|-------|-------|-------|
| touch | 48px | Minimum tap target size |
| touch-comfortable | 56px | Comfortable tap target size |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 4px | Inputs, small chips |
| md | 8px | Buttons, small cards |
| lg | 12px | Cards, modals |
| xl | 16px | Large cards, bottom sheets |
| 2xl | 24px | Floating action buttons |
| full | 9999px | Pills, avatars, circular buttons |

---

## Motion

### Duration

| Token | Value | Usage |
|-------|-------|-------|
| instant | 100ms | Immediate feedback (button press) |
| fast | 150ms | Micro-interactions, hover states |
| normal | 250ms | Default transitions, state changes |
| slow | 400ms | Modal opens, page transitions |
| slower | 600ms | Complex animations, skeleton loading |

### Easing

| Token | Value | Usage |
|-------|-------|-------|
| ease-out | `cubic-bezier(0.16, 1, 0.3, 1)` | Elements entering, appearing |
| ease-in-out | `cubic-bezier(0.65, 0, 0.35, 1)` | Symmetric transitions |
| spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy, playful interactions |
| bounce | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` | Attention-grabbing |

---

## Design Principles

### 1. Sunlight Readable
Every screen must be usable in bright Nigerian sunlight. High contrast ratios (minimum 4.5:1 for body text, 7:1 for critical info), bold colors, and clear iconography are non-negotiable.

### 2. Fat Finger Friendly
Minimum touch targets of 48px with comfortable spacing. Riders often book while walking, in traffic, or in bumpy vehicles — every interaction should be forgiving.

### 3. Connectivity Conscious
Design for 2G first. Loading states should be immediate, content should be skeleton-rendered, and the app should communicate network status clearly. Offline states are not errors — they're expected.

### 4. Trust Through Transparency
Show the full fare before booking. Display driver ratings, plate numbers, and photos prominently. Every naira spent should be explainable. Trust is earned pixel by pixel.

---

## Component Quick Reference

### Buttons
- **Primary:** Go Green background, inverse text, full radius-md
- **Secondary:** Transparent with border-default, text-primary
- **Ghost:** Transparent, text-secondary, hover shows bg-tertiary
- **Destructive:** Alert Red background for cancel/delete actions
- **All buttons:** Minimum height 48px, horizontal padding 24px

### Cards
- Background: bg-secondary
- Border: 1px border-subtle
- Radius: radius-lg
- Padding: spacing-md
- Shadow: shadow-sm (elevated: shadow-md)

### Status Indicators
- **Driver arriving:** Lagos Gold pulse animation
- **In transit:** Go Green solid
- **Completed:** Go Green with checkmark
- **Cancelled:** Alert Red
- **Searching:** Skeleton shimmer

### Vehicle Type Badges
- **Okada:** Okada Orange background, pill shape
- **Keke:** Keke Yellow background, pill shape

---

## Implementation Notes

1. Import `tokens.css` before any component styles
2. Use Tailwind classes for rapid prototyping
3. Reference CSS variables for custom components
4. Test all screens with iOS/Android high contrast mode
5. Validate touch targets with the 48px rule

```css
@import 'design-system/tokens.css';
```

```jsx
<button className="bg-go-green text-text-inverse min-h-touch px-lg rounded-md">
  Book Okada
</button>
```