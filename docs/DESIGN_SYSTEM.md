# BibleChat Design System (Master Guide)

Welcome to the **BibleChat Design System**. This design system is the single source of truth for all visual tokens, interaction patterns, and reusable UI components across the app.

---

## 1. Design Identity & Philosophy

The BibleChat aesthetic blends **Clean Apple Flat Minimalism** with **YouVersion Editorial Scripture**:

1. **Content-First & Serene**: Scripture and pastoral conversations take center stage. Chrome, cards, and buttons remain quiet, clean, and unobtrusive.
2. **Apple Flat Standard**:
   - Flat cards with smooth `continuous` rounded corners (`borderRadius: 24`).
   - Subtle 1px borders (`#E5E7EB` in light mode, `rgba(255,255,255,0.1)` in dark mode).
   - Minimalist elevations (zero heavy drop shadows).
3. **Editorial Scripture Typography**:
   - **Merriweather Serif** for scripture, verse text, and pastoral commentary.
   - **Instrument Serif** for monastic displays, liturgical chapter titles, and hero quote treatments.
   - **Poppins Sans-Serif** for modern, crisp UI labels, navigation, buttons, and system controls.
4. **Tactile 60fps Micro-Interactions**:
   - Every pressable element provides physical spring scale feedback (`scale: 0.97`) backed by `react-native-reanimated`.
   - Subtle haptic feedback (`Haptics.impactAsync(Light)`).
5. **Rigorous Accessibility**:
   - Minimum 44x44pt touch targets (`minTouchTarget: 44`) with expanded hit slops.
   - Contrast $\ge 4.5:1$ for all text against surfaces (WCAG AA / AAA compliant).
   - Zero emojis used as structural navigation or action icons (vector SVG icons only).

---

## 2. Three-Layer Token Architecture

Tokens are organized into three layers:
```
Primitive Tokens (Raw Palettes, Spacings, Radii, Fonts)
       ↓
Semantic Tokens (Surfaces, Text, Borders, Feedback, Theme)
       ↓
Component Tokens (Button, Card, Badge, Header, Modal Specs)
```

Import all tokens from one location:
```tsx
import { Tokens, Colors, Typography } from '@/theme';
// or
import { Tokens } from '@/components/design-system';
```

### 2.1 Primitives

#### Neutral Palette
| Token | Hex | Usage |
|---|---|---|
| `Tokens.palette.white` | `#FFFFFF` | Primary card background, text inverse |
| `Tokens.palette.gray50` | `#F9FAFB` | Subtle card background |
| `Tokens.palette.backgroundLight` | `#F6F6F6` | Default light screen background |
| `Tokens.palette.gray100` | `#F3F4F6` | Secondary button background, avatar fill |
| `Tokens.palette.borderLight` | `#E5E7EB` | Standard card and input border |
| `Tokens.palette.gray400` | `#9CA3AF` | Placeholder text, inactive icons |
| `Tokens.palette.gray500` | `#6B7280` | Muted subtitle text (WCAG 4.6:1) |
| `Tokens.palette.zinc900` | `#18181B` | Velvet Obsidian primary buttons, user bubble |
| `Tokens.palette.darkCard` | `#171717` | Luxury dark card background |
| `Tokens.palette.obsidian` | `#0B0B0B` | Bottom floating nav bar, dark screen bg |

#### Brand Accents
| Token | Hex | Usage |
|---|---|---|
| `Tokens.palette.royalBlue` | `#2563EB` | Primary CTA, verification, hyperlinks |
| `Tokens.palette.crimson` | `#E11D48` | Favorite hearts, active tab indicator, errors |
| `Tokens.palette.emerald` | `#10B981` | Online indicator, streak milestones, success |
| `Tokens.palette.amber` | `#F59E0B` | Streak fire icon, gold badges, prayer alerts |
| `Tokens.palette.violet` | `#7C3AED` | Apostles, pastoral themes, community badges |

#### 4/8dp Spacing Scale
```tsx
Tokens.spacing[0]  // 0
Tokens.spacing[1]  // 4pt
Tokens.spacing[2]  // 8pt
Tokens.spacing[3]  // 12pt
Tokens.spacing[4]  // 16pt  (Standard component padding)
Tokens.spacing[5]  // 20pt  (Standard screen horizontal gutter)
Tokens.spacing[6]  // 24pt
Tokens.spacing[8]  // 32pt
Tokens.spacing[10] // 40pt
Tokens.spacing[12] // 48pt
Tokens.spacing[16] // 64pt
```

#### Corner Radii (Continuous Curvature)
```tsx
Tokens.radii.xs   // 4
Tokens.radii.sm   // 8
Tokens.radii.md   // 12
Tokens.radii.lg   // 16
Tokens.radii.xl   // 20
Tokens.radii.xxl  // 24 (Signature Card & Button Radius)
Tokens.radii.hero // 28 (Featured Daily Card)
Tokens.radii.pill // 9999 (Tags, Pills, Badges)
```

---

## 3. Core Component Library

All design system primitives are located in `src/components/design-system`:

```tsx
import {
  DSScreen,
  DSHeader,
  DSCard,
  DSButton,
  DSText,
  DSBadge,
  DSInput,
  DSModal,
  Tokens
} from '../components/design-system';
```

---

### 3.1 `DSScreen`
High-level screen wrapper that handles `SafeAreaView`, `StatusBar`, layout scrolling, and **automatically manages bottom clearance for the floating navigation bar**.

```tsx
<DSScreen
  scrollable={true}
  hasFloatingNav={true} // Automatically leaves 96pt padding at the bottom!
  statusBarStyle="dark-content"
  backgroundColor={Tokens.palette.backgroundLight}
  header={<DSHeader title="Community" onBack={() => navigation.goBack()} />}
>
  {/* Page content here */}
</DSScreen>
```

---

### 3.2 `DSHeader`
Standard screen navigation header. Clears the top status bar notch automatically with safe-area insets.

```tsx
<DSHeader
  title="Scripture Memory"
  subtitle="5 verses memorized this week"
  onBack={() => navigation.goBack()}
  editorial={false} // Set true for InstrumentSerif Monastic title
  rightElement={
    <Pressable onPress={handleShare}>
      <Share2 size={20} color={Tokens.palette.zinc900} />
    </Pressable>
  }
/>
```

---

### 3.3 `DSCard`
Clean Apple Flat container with continuous corner curve, subtle 1px border, and optional interactive press animation.

```tsx
// Static Card
<DSCard variant="smooth" padding={16}>
  <DSText variant="h3">Today's Liturgy</DSText>
  <DSText variant="body" color="secondary">Morning Psalm and prayer</DSText>
</DSCard>

// Interactive Pressable Card (with spring scale & haptics)
<DSCard
  variant="hero"
  onPress={() => openStudyGuide()}
  elevated={true}
>
  <DSText variant="displayMedium">Daily Scripture</DSText>
</DSCard>
```

**Variants**:
- `smooth`: Standard white flat card (`borderRadius: 24`, `borderColor: #E5E7EB`).
- `hero`: Featured hero card (`borderRadius: 28`, `padding: 20`).
- `compact`: Dense list item (`borderRadius: 20`, `padding: 12`).
- `dark`: Luxury Obsidian card (`#171717`, `border: rgba(255,255,255,0.1)`).
- `subtle`: Subtle gray container (`#F9FAFB`).

---

### 3.4 `DSButton`
Universal button supporting velvet obsidian, mist gray, accent blue, and crimson themes, with size scales, spring animations, and built-in loading states.

```tsx
// Primary Obsidian Button
<DSButton
  label="Save for Offline"
  variant="primary"
  size="md"
  onPress={handleSave}
  leftIcon={<Download size={18} color="#FFFFFF" />}
/>

// Full-Width Accent Button with Loading State
<DSButton
  label="Confirm Membership"
  variant="accent"
  size="lg"
  fullWidth
  loading={isSubmitting}
  onPress={handleSubmit}
/>

// Secondary Mist Gray Button
<DSButton
  label="Cancel"
  variant="secondary"
  size="sm"
  onPress={handleCancel}
/>
```

**Variants**:
- `primary`: Velvet Obsidian (`#18181B` with white text).
- `secondary`: Mist Gray (`#F3F4F6` with dark text).
- `accent`: Royal Blue (`#2563EB` with white text).
- `crimson`: Rose Crimson (`#E11D48` with white text).
- `outline`: Bordered transparent button.
- `ghost`: Borderless button for minimal actions.
- `destructive`: Soft crimson background with red text.

**Sizes**:
- `sm`: 36pt height, 12.5pt font.
- `md`: 48pt height, 14.5pt font (Standard).
- `lg`: 56pt height, 16pt font (Hero CTA).

---

### 3.5 `DSText`
Type-safe text component that automatically pairs font families, font sizes, line heights, and WCAG-compliant colors.

```tsx
// Monastic Chapter Title (Instrument Serif)
<DSText variant="scriptureTitle">Romans 8</DSText>

// Scripture Verse (Merriweather Serif)
<DSText variant="scripture">
  "There is therefore now no condemnation for those who are in Christ Jesus."
</DSText>

// UI Headings (Poppins Bold/SemiBold)
<DSText variant="h1">Good morning, David</DSText>
<DSText variant="h2">Recent Conversations</DSText>
<DSText variant="h3">Faith Streaks</DSText>

// Body & Microcopy (Poppins Regular)
<DSText variant="body" color="secondary">
  Complete your daily kingdom deed to keep your 12-day streak alive.
</DSText>
<DSText variant="caption" color="muted">Yesterday at 8:45 PM</DSText>
```

---

### 3.6 `DSBadge`
Badges and pills for translation codes (NIV, WEB), categories, streaks, and roles.

```tsx
<DSBadge label="WEB • Offline Ready" variant="soft" color="brand" size="md" />
<DSBadge label="NIV" variant="solid" color="neutral" size="sm" />
<DSBadge label="14-Day Streak" variant="soft" color="gold" size="md" leftIcon={<Flame size={12} color="#F59E0B" />} />
```

---

### 3.7 `DSInput`
Polished text input with leading/trailing icons, clear button, active focus border, and accessible error message.

```tsx
<DSInput
  label="Search Scriptures"
  placeholder="Search by book, keyword, or topic..."
  value={searchQuery}
  onChangeText={setSearchQuery}
  clearable={true}
  leadingIcon={<Search size={18} color={Tokens.palette.gray400} />}
  helperText="Try 'Grace', 'Psalm 23', or 'Faith'"
/>
```

---

### 3.8 `DSModal`
Bottom sheet container with backdrop scrim, drag handle, title bar, and automatic safe area handling.

```tsx
<DSModal
  visible={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Select Translation"
  subtitle="All versions are free and offline-compatible"
>
  <View style={{ gap: 12 }}>
    {/* Modal content */}
  </View>
</DSModal>
```

---

## 4. Boilerplate for Creating Future Pages (3-Minute Recipe)

Copy this template whenever you create a new screen:

```tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  DSScreen,
  DSHeader,
  DSCard,
  DSButton,
  DSText,
  DSBadge,
  Tokens
} from '../components/design-system';
import { Bookmark, Sparkles } from 'lucide-react-native';

export interface NewScreenProps {
  navigation: any;
}

export const NewScreen: React.FC<NewScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <DSScreen
      scrollable={true}
      hasFloatingNav={true}
      header={
        <DSHeader
          title="Daily Reflection"
          subtitle="Walk with the Word"
          onBack={() => navigation.goBack()}
          rightElement={
            <DSButton
              variant="ghost"
              size="sm"
              onPress={() => console.log('Bookmark')}
              leftIcon={<Bookmark size={18} color={Tokens.palette.zinc900} />}
            />
          }
        />
      }
    >
      {/* 1. Hero Card */}
      <DSCard variant="hero" elevated style={styles.sectionCard}>
        <View style={styles.badgeRow}>
          <DSBadge label="Verse of the Day" variant="soft" color="brand" size="sm" />
          <DSBadge label="WEB" variant="solid" color="neutral" size="sm" />
        </View>

        <DSText variant="scripture" style={styles.scriptureText}>
          "For where your treasure is, there your heart will be also."
        </DSText>

        <DSText variant="caption" color="muted" align="right">
          Matthew 6:21 (WEB)
        </DSText>
      </DSCard>

      {/* 2. Interactive Feature Card */}
      <DSCard
        variant="smooth"
        onPress={() => console.log('Card tapped')}
        style={styles.sectionCard}
      >
        <DSText variant="h3">Guided Reflection</DSText>
        <DSText variant="body" color="secondary" style={styles.cardBody}>
          Take 3 minutes to reflect on what you value most in this season of life.
        </DSText>

        <DSButton
          label="Begin Prayer"
          variant="primary"
          size="md"
          fullWidth
          loading={isLoading}
          onPress={() => setIsLoading(!isLoading)}
          leftIcon={<Sparkles size={16} color="#FFFFFF" />}
        />
      </DSCard>
    </DSScreen>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    marginBottom: Tokens.spacing[4]
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing[2],
    marginBottom: Tokens.spacing[3]
  },
  scriptureText: {
    marginBottom: Tokens.spacing[3]
  },
  cardBody: {
    marginTop: Tokens.spacing[1],
    marginBottom: Tokens.spacing[4]
  }
});
```

---

## 5. Pre-Delivery UI/UX Checklist

Before deploying or submitting any new screen, verify:

- [ ] **Zero Hardcoded Hex Codes**: Colors are sourced from `Tokens.palette`, `Tokens.colors`, or semantic component props.
- [ ] **Touch Target $\ge$ 44pt**: Every button and icon touch target meets the 44x44pt minimum with hitSlop.
- [ ] **Floating Navigation Clearance**: Any scrollable view with bottom navigation sets `hasFloatingNav={true}` (or 96pt bottom inset) so the floating pill navbar never obstructs the lowest card or button.
- [ ] **Safe-Area Insets**: Screen headers use `DSHeader` or `useSafeAreaInsets` to prevent colliding with the iOS notch or Android status bar.
- [ ] **WCAG 4.5:1 Text Contrast**: Normal text uses `textPrimary` (`#111827`) or `textSecondary` (`#4B5563`), ensuring sharp legibility.
- [ ] **No Emojis as Structural Icons**: Vector SVG icons from `lucide-react-native` are used for buttons, navigation, and badges.
- [ ] **Interactive Haptic & Spring Feedback**: All buttons and tappable cards use Reanimated spring scale (`0.97`) and subtle haptics.
