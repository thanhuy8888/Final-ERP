# 🎨 Visual Style Guide - Quick Reference

## Color Palette

### Primary Colors

```
Red Cross Red:  #ED1B2E  ████████  Main brand color, CTAs, accents
Dark Red:       #C41E3A  ████████  Hover states, darker elements
Light Red:      #FF4655  ████████  Highlights
```

### Neutrals

```
Pure White:     #FFFFFF  ████████  Backgrounds, text on dark
Pure Black:     #000000  ████████  Secondary CTAs, headings
Charcoal:       #2B2B2B  ████████  Text, dark elements
Dark Gray:      #333333  ████████  Body text
Medium Gray:    #666666  ████████  Secondary text
Light Gray:     #999999  ████████  Tertiary text, placeholders
Ultra Light:    #F5F5F5  ████████  Subtle backgrounds
```

### Accent Colors

```
Cyan:           #4FC3F7  ████████  Media, video elements
Blue:           #00A8E1  ████████  Links, info
Light Pink:     #FFF0F1  ████████  Subtle backgrounds
Soft Blue:      #E3F2FD  ████████  Alternate backgrounds
```

### Semantic Colors

```
Success:        #4CAF50  ████████  Success messages, confirmed
Warning:        #FF9800  ████████  Warnings, pending
Error:          #F44336  ████████  Errors, cancelled
Info:           #4FC3F7  ████████  Information, tips
```

---

## Typography Scale

```
Hero Title      80px    ████████████████  "Shop the Latest"
Heading 1       64px    ██████████████    Main page titles
Heading 2       48px    ████████████      Section headers
Heading 3       36px    ██████████        Card titles
Heading 4       28px    ████████          Subsections
Heading 5       20px    ██████            Small headers
Body Large      18px    █████             Intro paragraphs
Body Regular    16px    ████              Standard text
Body Small      14px    ███               Secondary info
Caption         12px    ██                Tiny labels
```

---

## Spacing System

```
xs    8px   ▌         Button icon gaps
sm    16px  ▌▌        Small gaps between elements
md    24px  ▌▌▌       Medium spacing
lg    32px  ▌▌▌▌      Large spacing between sections
xl    48px  ▌▌▌▌▌▌    Extra large gaps
2xl   64px  ▌▌▌▌▌▌▌▌  Section padding
3xl   80px  ▌▌▌▌▌▌▌▌▌▌  Large section spacing
4xl   96px  ▌▌▌▌▌▌▌▌▌▌▌▌  Hero padding
5xl   120px ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌  Maximum spacing
```

---

## Border Radius

```
sm    8px   ╭─╮  Buttons, tags
            │ │
            ╰─╯

md    12px  ╭──╮  Form inputs
            │  │
            ╰──╯

lg    16px  ╭───╮  Cards, containers
            │   │
            ╰───╯

xl    24px  ╭────╮  Large cards
            │    │
            ╰────╯

pill  9999px ╭─────────╮  Buttons, badges
             ╰─────────╯
```

---

## Shadows

```
sm    0 2px 8px rgba(0,0,0,0.08)      Subtle lift
md    0 4px 20px rgba(0,0,0,0.12)     Standard elevation
lg    0 8px 30px rgba(0,0,0,0.16)     Prominent cards
xl    0 12px 40px rgba(0,0,0,0.20)    Maximum elevation

red   0 4px 20px rgba(237,27,46,0.25)  Red glow (buttons)
red   0 8px 30px rgba(237,27,46,0.35)  Red glow hover
```

---

## Button Styles

### Primary Button (Red)

```
┌─────────────────────┐
│  Shop Now  →        │  Background: #ED1B2E
└─────────────────────┘  Color: White
                         Padding: 18px 40px
                         Border Radius: Pill
```

### Secondary Button (Black)

```
┌─────────────────────┐
│  Learn More         │  Background: #000000
└─────────────────────┘  Color: White
```

### Outline Button

```
┌─────────────────────┐
│  View Details       │  Border: 2px Red
└─────────────────────┘  Background: Transparent
```

---

## Card Components

### Product Card

```
╔═══════════════════╗
║                   ║
║   Product Image   ║  Aspect: 120%
║                   ║
╠═══════════════════╣
║ Product Name      ║  Left-aligned
║ $99.99           ║  Red, bold
╚═══════════════════╝
```

### Stat Card

```
╔═══════════════════╗
║                   ║
║      2.3M         ║  64px, red, bold
║   Customers       ║  14px, gray
║                   ║
╚═══════════════════╝
```

### Order Card

```
╔═══════════════════════════════╗
║ Gradient Header               ║
║ Order #12345  |  $156.00     ║
╠═══════════════════════════════╣
║ [img] Item 1         $50.00  ║
║ [img] Item 2         $75.00  ║
╠═══════════════════════════════╣
║ [View] [Track] [Reorder]     ║
╚═══════════════════════════════╝
```

---

## Form Elements

### Input Field

```
┌─────────────────────────────┐
│ user@example.com            │  2px border
└─────────────────────────────┘  Focus: Red border + shadow
```

### Select Dropdown

```
┌─────────────────────────────┐
│ Select option           ▼   │  Same as input
└─────────────────────────────┘  Arrow icon
```

### Checkbox

```
☐  Unchecked (2px gray border)
☑  Checked (red fill, white ✓)
```

### Radio Button

```
◯  Unselected (2px gray border)
◉  Selected (red fill, white dot)
```

---

## Status Badges

```
● Pending      Orange background, 10% opacity
● Confirmed    Blue background, 10% opacity
● Shipped      Purple background, 10% opacity
● Delivered    Green background, 10% opacity
● Cancelled    Red background, 10% opacity
```

---

## Layout Grid

### Desktop (1280px max-width)

```
┌─────────────────────────────────────────┐
│  [CONTENT AREA - 1280px max]            │
│  ┌──────────┬──────────┬──────────┐    │
│  │  Col 1   │  Col 2   │  Col 3   │    │
│  └──────────┴──────────┴──────────┘    │
└─────────────────────────────────────────┘
     32px padding each side
```

### Product Grid

```
┌────┬────┬────┬────┐  4 columns (desktop)
│    │    │    │    │
└────┴────┴────┴────┘  300px min-width
```

### Two-Column Layout (Checkout/Product Detail)

```
┌─────────────────┬─────────┐
│                 │         │
│    Main         │ Sidebar │  60/40 split
│    Content      │ (sticky)│
│                 │         │
└─────────────────┴─────────┘
```

---

## Animation Timings

```
Fast:   150ms  ─────▶  Micro-interactions
Base:   250ms  ────────▶  Standard transitions
Slow:   350ms  ──────────▶  Large elements
Bounce: 400ms  ─────────▶  Playful effects
```

---

## Responsive Breakpoints

```
┌──────────────────────────────────────┐
│  Desktop (1440px+)                   │  Full layout
└──────────────────────────────────────┘

┌────────────────────────────────┐
│  Laptop (1024-1440px)          │      Hero: single column
└────────────────────────────────┘

┌──────────────────────────┐
│  Tablet (768-1024px)     │            2-col grids
└──────────────────────────┘

┌────────────────────┐
│  Mobile (375-768px)│                  1-col, stacked
└────────────────────┘

┌──────────────┐
│  Small (375px)│                       Minimum size
└──────────────┘
```

---

## Icon System

### Arrow Icons

```
→  Right arrow (buttons, links)
←  Left arrow (back buttons)
↑  Up arrow (scroll to top)
↓  Down arrow (dropdowns)
```

### Status Icons

```
✓  Success/checkmark
✕  Error/close
●  Status dot
🔒 Security/locked
🛒 Cart/shopping
```

### Emoji Usage

```
🩸  Blood/health (hero)
📦  Orders/shipping
💳  Payment
🏪  Store/shop
⚠  Warning
```

---

## Common Patterns

### Hero Section Pattern

```
┌─────────────────────────────────────┐
│ ┌─────────────┬───────────────┐    │
│ │             │               │    │
│ │  HEADLINE   │   [Image]     │    │
│ │  • Bullet   │   + Stats     │    │
│ │  [CTA][CTA] │               │    │
│ │             │               │    │
│ └─────────────┴───────────────┘    │
└─────────────────────────────────────┘
```

### Filter Bar Pattern

```
┌─────────────────────────────────────┐
│  🔍 [Search.............]            │
│  [Min $] - [Max $] [Material ▼]     │
└─────────────────────────────────────┘
```

### Cart Item Pattern

```
┌─────────────────────────────────────┐
│ [img] Product Name          $99.99  │
│       Size: M | Color: Blue         │
│       [-] 2 [+]              Remove │
└─────────────────────────────────────┘
```

---

## Z-Index Layers

```
1070  Tooltips      ▓▓▓▓▓▓▓
1060  Popovers      ▓▓▓▓▓▓
1050  Modals        ▓▓▓▓▓
1040  Modal Backdrop▓▓▓▓
1030  Fixed Elements▓▓▓
1020  Sticky Headers▓▓
1000  Dropdowns     ▓
   1  Base Layer    ░
```

---

## Quick Copy-Paste Classes

```css
/* Center content */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Card base */
.card {
  background: var(--pure-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-xl);
}

/* Primary button */
.btn-primary {
  background: var(--red-cross-primary);
  color: var(--pure-white);
  padding: 18px 40px;
  border-radius: var(--radius-pill);
  transition: all var(--transition-base);
}

/* Section spacing */
.section {
  padding: var(--space-4xl) 0;
}

/* Container */
.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}
```

---

## Design Checklist

When creating new components:

- [ ] Uses CSS variables from theme
- [ ] Has hover state (lift + darken)
- [ ] Has focus state (red outline)
- [ ] Includes smooth transition
- [ ] Mobile responsive
- [ ] Accessible contrast ratio
- [ ] Follows spacing system
- [ ] Uses consistent border-radius
- [ ] Includes loading state
- [ ] Has empty state design

---

**Last Updated**: December 2025  
**Version**: 1.0.0  
**For**: Final-ERP Customer Interface
