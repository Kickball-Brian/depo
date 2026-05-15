# Eligibility Checker Style — Replicate for LawLogic Form

When the LawLogic form is wired into the staging server, the form section should visually match the "Do You Qualify?" eligibility checker section.

## Section container
- Class: `section--dark` — deep navy background with radial purple/indigo gradient overlays and dot-grid texture (see CSS `.section--dark` and `::before`)
- Full-width padded section (`section--padded`)
- Section heading: white, centered (`section_heading--light`)
- Sub-lead: muted white (`section_lead--light`)

## Card (`.elig-card`)
- Background: `rgba(255,255,255,0.07)` — glassmorphism
- Border: `1px solid rgba(255,255,255,0.15)`
- Border radius: `var(--r-xl)` (24px)
- Padding: `2.5rem`
- `backdrop-filter: blur(10px)`
- Max-width: `640px`, centered via `.eligibility-widget`

## Step progress dots (`.elig-step-indicator`)
- Row of thin pills (height 4px, flex-grow)
- Inactive: `rgba(255,255,255,0.2)`
- Active step: `var(--c-gold)` (#E8952C amber)
- Completed step: `#4ade80` (green)

## Question text (`.elig-question`)
- Color: white
- Font size: 1.25rem, weight 700

## Hint text (`.elig-hint`)
- Color: `rgba(255,255,255,0.58)`
- Font size: 0.875rem

## Option buttons (`.elig-option`)
- Full-width, left-aligned
- Border: `1.5px solid rgba(255,255,255,0.2)`
- Background: `rgba(255,255,255,0.05)`
- Color: `rgba(255,255,255,0.9)`
- Hover / selected: amber border `var(--c-gold)`, background `rgba(232,149,44,0.12)`
- Radio circle icon on left

## CTA button (`.elig-result-cta`)
- Background: `var(--c-gold)` (#E8952C)
- Border-radius: `var(--r-full)` (pill)
- Box-shadow: `0 4px 16px rgba(232,149,44,.45)`
- Full amber pill button, centered

## Vue transitions
- Step change: `elig-fade` (opacity + translateX slide)
- Result appear: `elig-fade` with `appear`
- FAQ answers: `faq-slide` (max-height + opacity)

## Notes for form integration
- Mount the LawLogic form inside `#eligibility-app` or replace it entirely
- Keep the `section--dark` wrapper, `.elig-card` container, and amber CTA button style
- The form should feel like a continuation of the qualifier — same dark card, same amber submit button
