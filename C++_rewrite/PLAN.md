# Waqt: Native Rewrite Planning Document

## 1. Executive Summary & Architectural Vision

This document is the specification for a **greenfield Native Android application** with a **C++ core**, inspired by the existing Waqt app’s behavior and design.

**This is not a React Native migration.** The new project has zero dependency on React Native, JavaScript, Expo, or any JS library. It is built from scratch with C++20 and Kotlin/Jetpack Compose only. There is **no data import or compatibility layer** for the old app — users start with a clean slate.

### What Must Match (Outcomes)

Preserve user-visible **behavior and design**: prayer tracking with Fajr-shifted days, prayer-time calculation options, dual notifications, streak history grid, settings, theming, and overall look-and-feel described in §4.

### What May Differ (Implementation)

Choose the best native approach wherever it produces the same outcome. Do **not** copy old project structure, storage quirks, workarounds, or technology choices unless they are genuinely the best option.

Examples of encouraged differences:

*   SQLite or a single structured file instead of hundreds of AsyncStorage keys
*   Native C++ `bool` / `int` types instead of stringified `"true"` / `"15"`
*   ViewModel + `StateFlow` instead of React Context providers
*   Typed JNI structs or Kotlin data classes instead of JSON strings across the bridge (if safer and clearer)
*   Compose `fontFeatureSettings = "tnum"` instead of the `\u2007` figure-space hack
*   A clean Sunday-start grid algorithm instead of the old app’s 4-hour weekday shift hack (if the rendered grid is equivalent)
*   Material Icons instead of legacy Android system drawables
*   A well-named C++ class holding Fajr cutoff state instead of a loose global variable

When in doubt: **specify the outcome, not the old code path.**

### Architecture Topology

*   **Layer 1 (UI):** Kotlin + Jetpack Compose.
*   **Layer 2 (Bridge):** JNI — thin adapter only; no business logic here.
*   **Layer 3 (Core):** Pure C++20 — dates, prayer math, persistence, notification schedule computation, and domain rules.

The C++ core must remain platform-agnostic (no `<jni.h>` in core headers) so a future Swift/SwiftUI iOS shell can reuse it.

### Kotlin / Compose Coding Standards

Write the Android UI layer **as simply as possible**, even if verbose. Target reader: a beginner who can follow every screen without guessing.

*   Prefer explicit step-by-step code over clever abstractions.
*   **Comment everything.** Every file gets a brief role description. Every function gets an **RME (Read, Modify, Effects)** block comment: what it reads, what it changes, and side effects (disk, alarms, permissions, etc.).
*   Use clear names (`schedulePrayerEndNotification`, not `schedEnd`).
*   One obvious approach per screen unless duplication becomes painful.

---

## 2. The C++ Core (Business Logic)

Modern C++20. No platform-specific headers in the core. All prayer-time math — including middle-of-the-night — lives in C++ via a dedicated library or custom astronomical implementation. **Do not reference or port from JavaScript libraries**; use standard prayer-time references (e.g. [praytimes.org](https://praytimes.org/docs/calculation)) and validate with unit tests.

### 2.1 Storage & Persistence

**Fresh install only.** No migration from the old app. No legacy key formats. No AsyncStorage compatibility.

Use an idiomatic persistence layer. Recommended options (pick one):

| Approach | Notes |
|----------|-------|
| **SQLite** | Strong choice for history queries and typed columns |
| **Single JSON file** | Acceptable for simplicity at current data scale |

Avoid hundreds of tiny per-day files unless there is a compelling reason.

#### Preferences

Use native types internally (`bool`, `int`, enums). Serialize however the storage layer requires.

| Field | Type | Default |
|-------|------|---------|
| `showStartTime` | bool | `true` |
| `showEndTime` | bool | `true` |
| `calculationMethod` | enum / string | `MoonsightingCommittee` |
| `madhab` | enum / string | `shafi` |
| `themeColor` | see §4.1 | Material You (dynamic) |
| `endTimeOffset` | int (minutes) | `15` |

#### History

Store completion status per calendar day key (`YYYY-MM-DD` per §2.2) and prayer ID (`fajr`, `dhuhr`, `asr`, `maghrib`, `isha`).

Example logical record: `{ date: "2025-10-25", fajr: true, dhuhr: false, … }`.

Required operations: lookup by date, upsert prayer status, list all history (for streak screen), wipe all history.

**`deleteAllHistory()`:** Delete all prayer completion records. **Do not** delete preferences/settings.

### 2.2 Time & Date Manipulation (The Fajr Shift)

**Required behavior:** A “day” runs until the **next day’s Fajr**, not midnight. Users can log late Isha after midnight without it counting toward the wrong day.

**Required API (names flexible):**

*   Update Fajr cutoff whenever prayer times are recalculated (minutes from local midnight).
*   `getDateKey(datetime)` → `YYYY-MM-DD` after applying the Fajr cutoff shift.

**Edge case:** Before the first successful location-based calculation, cutoff may be `0` (calendar-day behavior) until real Fajr times are available.

**Example:** Fajr at 5:15 AM → any local time before 5:15 on Oct 26 belongs to Oct 25.

Use `<chrono>` (or equivalent) for datetime math.

### 2.3 Prayer Time Calculation

Implement in C++. Outcome must match established prayer-time conventions for each method below — validated by unit tests with known lat/lng/date fixtures, not by matching a specific JS library byte-for-byte.

#### Calculation methods

| UI Label | Identifier |
|----------|------------|
| Muslim World League | `MuslimWorldLeague` |
| Egyptian General Authority of Survey | `Egyptian` |
| University of Islamic Sciences, Karachi | `Karachi` |
| Umm Al-Qura University, Makkah | `UmmAlQura` |
| Dubai | `Dubai` |
| Moonsighting Committee Worldwide | `MoonsightingCommittee` *(default)* |
| Islamic Society of North America (ISNA) | `NorthAmerica` |
| Kuwait | `Kuwait` |
| Qatar | `Qatar` |
| Singapore | `Singapore` |
| Turkey | `Turkey` |
| Tehran | `Tehran` |

#### Madhab (Asr shadow)

| UI Label | Identifier |
|----------|------------|
| Shafi/Maliki/Hanbali | `shafi` *(default)* |
| Hanafi | `hanafi` |

#### Prayer window model (10 values exposed to UI)

For a given date and coordinates, provide start and end for each prayer:

| Prayer | Start | End |
|--------|-------|-----|
| Fajr | Fajr | Sunrise |
| Dhuhr | Dhuhr | Asr |
| Asr | Asr | Maghrib |
| Maghrib | Maghrib | Isha |
| Isha | Isha | Middle of the night |

**Middle of the night:** Standard Islamic “middle of the night” calculation (midpoint between Maghrib/Isha window and Fajr — implement per established astronomical prayer-time references and test against known fixtures).

If location or settings are unavailable, times may be absent; UI shows `"--:--"`.

### 2.4 Notification Schedule Computation

C++ computes which notifications should fire. Kotlin owns Android scheduling.

**Per future day, per prayer:**

1. Skip if that prayer is already complete for that day’s `getDateKey()`.
2. **Start notification** — if start time is in the future:
   * Title: `"It's time for {Fajr|Dhuhr|Asr|Maghrib|Isha}"`
   * Body: empty
3. **End (Waqt) notification** — if `(endTime − endTimeOffset)` is in the future:
   * Title: `"{Prayer} time is ending in {offset} minutes"`
   * Body: empty

**Horizon:** Generate the full ordered list of future notifications. Kotlin schedules as many as the platform allows (see §5.1), nearest first, and refreshes the queue on the triggers below.

**Re-schedule when:**

*   App returns to foreground
*   User toggles a prayer checkbox
*   Calculation method, madhab, or end-time offset changes
*   Location becomes available after being denied

---

## 3. Platform Bridge Layer (JNI)

Keep the bridge **thin**. Core logic stays in C++; JNI only marshals data and calls.

**Minimum surface area:**

*   Preferences read/write
*   History read / update / deleteAll
*   Fajr cutoff + `getDateKey()`
*   Prayer times for `(lat, lng, date)`
*   Notification schedule list (timestamps + titles)
*   Optional: streak grid data per prayer (or compute in Compose — see §4.3)

**Serialization:** Use whatever is safest and simplest — typed Kotlin data classes, JNI field mapping, Protocol Buffers, or JSON strings. JSON is fine but not required. Avoid leaking JNI types into the C++ core.

**Callbacks:** Optional. Kotlin may also poll or re-query on lifecycle events.

---

## 4. UI Layer: Jetpack Compose (Android)

Match the **visual spec** below. Implementation details (composables, state hoisting, navigation library) are up to the developer.

Use Material 3. Follow §1 coding standards.

### 4.0 App Shell

| Property | Requirement |
|----------|-------------|
| Orientation | Portrait |
| Theme | Follow system light/dark |
| Navigation | Bottom tabs: **Home**, **History**, **Settings** |

**Tab vs screen naming:** Tab label **“History”**; screen title on that tab **“Streak”**.

**Tab bar:** Material 3 colors — background `surfaceContainer`, selected indicator `secondaryContainer`, icons/labels using `primary` / `onSurfaceVariant` / `onSecondaryContainer` / `onSurface` as appropriate.

**Splash:** Brand logo on light background (light mode) or dark background (dark mode). Dismiss when app is ready.

**Layout padding:** ~`20dp` horizontal content padding; enough bottom padding that scroll content clears the tab bar (~`120dp` or equivalent).

**Safe area:** History and Settings respect status-bar inset; Home uses top spacing per layout spec (logo `marginTop ~60dp`).

### 4.1 Material You & Theming

**Default:** Material You dynamic colors (Android 12+).

**Custom accent colors** (8 options, 2-column grid):

| Name | Hex |
|------|-----|
| Blue | `#007AFF` |
| Green | `#34C759` |
| Indigo | `#5856D6` |
| Orange | `#FF9500` |
| Purple | `#AF52DE` |
| Red | `#FF3B30` |
| Teal | `#5AC8FA` |
| Yellow | `#FFCC00` |

When a custom color is selected, use it as the Material 3 seed. A dedicated “Material You” option restores dynamic theming.

**Storage:** Persist the user’s theme choice however makes sense (`enum`, bool + optional hex, etc.) — no requirement to store the literal string `"Material You"` unless convenient.

**Fallback colors** when dynamic theming is unavailable: define a complete Material 3 token set for light and dark so the app never looks broken. Reference palette from the original app:

*   Light: text `#11181C`, background `#FFFFFF`, accent `#4F8EF7`
*   Dark: text `#ECEDEE`, background `#151718`, accent `#85B1FF`

Map tokens (`primary`, `surfaceContainer`, `error`, `outline`, etc.) sensibly for both schemes.

Theme changes may be instant; animated transitions are optional polish.

### 4.2 Micro-Interactions & Visual Tokens

These are **design targets**, not mandates to copy RN workarounds:

| Element | Target |
|---------|--------|
| Primary cards | ~`12dp` corner radius |
| Theme cards | ~`16dp` corner radius |
| Time pills / inputs | ~`8dp` radius |
| Delete button | ~`30dp` radius (pill shape) |
| Streak cells | ~`16×16dp`, ~`4dp` radius |
| Color swatches | ~`40×40dp` circles |
| Prayer card elevation | Subtle (e.g. `2dp`) |
| Press feedback | Visible but subtle opacity or ripple |
| Checkboxes | Themed with `primary` / `onSurfaceVariant`; fit slim row layout |
| Ripples | Clipped to rounded bounds |
| Times | 12-hour format `h:mm a`; aligned columns (prefer `tnum` tabular figures); missing times → `"--:--"` |
| Typography | Title ~`30sp` bold; section headers ~`22sp` bold; body ~`16sp`; prayer names ~`18sp`; times ~`15sp` semi-bold |

Achieve the layout with idiomatic Compose — do not replicate negative margins or other RN-specific hacks unless truly necessary.

### 4.3 Screen-by-Screen Breakdown

#### Home

*   Centered brand logo ~`180×180dp`, substantial top margin (~`60dp`), spacing before prayer list (~`36dp`).
*   Logo variant should contrast with background (light logo on dark theme, dark logo on light theme).
*   Five prayers in order: Fajr, Dhuhr, Asr, Maghrib, Isha.
*   Each row: checkbox, name, optional start/end time pills separated by em dash `—` when both enabled.
*   Entire row toggles completion.
*   Incomplete row: `surfaceContainer` background, `onSurface` text.
*   Completed row: `primaryContainer` background, `onPrimaryContainer` text.
*   Respect `showStartTime` / `showEndTime` preferences (reactive UI — no need to mimic “reload on tab focus” unless that pattern is chosen).
*   On toggle: persist via C++, re-schedule notifications.

#### History / Streak

*   Title **“Streak”**, centered.
*   Loading indicator while history loads.
*   **Five** contribution-style grids (one per prayer), each in a card (`surfaceContainer`, ~`12dp` radius).
*   **105 days** of history per prayer.
*   GitHub-style grid: weekday labels `S M T W T F S` on the left; weeks as columns; completed days filled with `primary`, incomplete with `surface`.
*   Completion lookup uses `getDateKey()` for each day — **required**.
*   Grid layout algorithm is **implementation-flexible**. The old app used a 4-hour shift for weekday alignment; you may use any correct Sunday-start (or equivalent) layout algorithm if the visual result matches: 105 days, weekday labels aligned, completed/incomplete coloring correct.

#### Settings

*   Title **“Settings”**.
*   Sections:

1. **Notifications** — “Waqt end time reminder (minutes before)”; numeric input, default `15`, non-negative integers only.
2. **Prayer Times** — Calculation method dropdown (12 options); Madhab dropdown (2 options). Changes apply immediately (recalculate times + re-schedule notifications).
3. **Appearance** — Independent toggles for showing start time and end time on Home; Material You option; 8-color grid (2 columns).
4. **Danger Zone** — `⚠️ Danger Zone ⚠️` header; red **“DELETE ALL RECORDS”** button; confirmation dialog; wipes history only.

Use standard Compose controls (`ExposedDropdownMenuBox`, `SegmentedButton`, `AlertDialog`, etc.) — exact widget choice is flexible if behavior and appearance match.

---

## 5. OS Integrations (Kotlin)

### 5.1 Notifications

**Two types:** prayer start (at adhan) and prayer end (at end time minus offset). Exact title strings in §2.4.

**Scheduling:**

*   Cancel existing app alarms, then schedule from C++’s list.
*   Schedule **as many as Android allows** (exact-alarm quota — typically on the order of hundreds; prioritize nearest events).
*   Refresh queue on the re-schedule triggers in §2.4.

**Recommended Android stack:** `AlarmManager` with exact alarms + `BroadcastReceiver` (or `AlarmManager` + `PendingIntent` to a notification helper). WorkManager alone is too imprecise for prayer times.

**Channel:** Default channel with vibration acceptable (e.g. `[0, 250, 250, 250]`).

**Content:** Sound on; empty body; no badge.

**Foreground:** Show notifications even when app is open.

**Permissions:** Notification permission (Android 13+) and location (foreground). Graceful degradation if denied — no crash; times show `"--:--"`; skip scheduling.

**Icon:** Monochrome notification icon on brand-appropriate background.

### 5.2 Location

*   `FusedLocationProviderClient` (or equivalent modern API).
*   Foreground location only.
*   Rationale copy along the lines of: *“Allow Waqt to use your location.”*
*   Pass coordinates to C++ for prayer calculation and Fajr cutoff update.

---

## 6. Brand Assets

Reuse existing Waqt branding (copy into `res/`, do not “migrate” runtime data):

| Asset | Use |
|-------|-----|
| Light/dark logo variants | In-app header + splash |
| Adaptive launcher icon | App icon |
| Notification icon | Status bar / shade |

---

## 7. Out of Scope (v1)

Not in the current app; do not block v1 on these:

*   Haptics
*   Backup / restore
*   Widgets
*   Export history
*   Kaza / advanced scoring
*   Extra history visualizations (bar charts, month/year views)
*   Import from old React Native app

---

## 8. Development Milestones

1. **C++ Core** — Storage, Fajr-shift dates, prayer math (all methods + middle of night), notification schedule generator. **GoogleTest** with fixture coordinates/dates.
2. **JNI + OS** — Bridge, location, AlarmManager scheduling to platform limit.
3. **Compose UI** — Tab shell, three screens, theming per §4.
4. **Acceptance** — Verify against **this document’s outcomes** (behavior, copy, layout spec). Optional visual check against the old app screenshots for design reference — not a requirement to share code or architecture with the old project.
