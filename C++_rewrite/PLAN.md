# Waqt: Native Rewrite Planning Document

## 1. Executive Summary & Architectural Vision
This document outlines the master plan for refactoring the Waqt application from React Native (Expo) into a **Native Android application with a C++ Core**. 

The fundamental goal is **zero compromises**: every micro-interaction, aesthetic detail, logic quirk (like midnight offsets), and functional capability must be preserved 1-to-1. 

Additionally, the architecture must strictly isolate business logic into C++ to allow a seamless drop-in of a Swift/iOS UI in the future.

### Architecture Topology
*   **Layer 1 (UI / View):** Kotlin + Jetpack Compose (Android) / Swift + SwiftUI (iOS Future).
*   **Layer 2 (Bridge / Presenter):** JNI (Java Native Interface) for Android / Objective-C++ for iOS.
*   **Layer 3 (Core Logic / C++):** Pure standard C++20 for all date manipulation, astronomy math, local persistence, and state management.

---

## 2. The C++ Core (Business Logic)
Use modern C++20. No platform-specific dependencies (no `<jni.h>` leaking into the core, no iOS specific headers).

### 2.1 Storage & Persistence
*   **Current State:** JSON-based `AsyncStorage`.
*   **C++ State:** Use `nlohmann/json` (a single-header C++ JSON library) for simple disk I/O, or `SQLite` if relational querying becomes necessary. For 1-to-1 parity, JSON file storage on the internal app data directory is sufficient.
*   **Preferences Schema:** Needs to store: `showStartTime`, `showEndTime`, `calculationMethod`, `madhab`, `themeColor`, `endTimeOffset`.
*   **History Schema:** Needs to store a historical array of objects mapping `YYYY-MM-DD` to a boolean map of `fajr`, `dhuhr`, `asr`, `maghrib`, `isha`.

### 2.2 Time & Date Manipulation (The 4-Hour Shift)
*   **Critical Constraint:** The app considers a "day" to run until 4:00 AM the following morning so users can log late Isha prayers without breaking streaks.
*   **Implementation:** Use standard `<chrono>`. The core C++ function `getDateKey()` must fetch the current UTC time, adjust for local timezone, subtract exactly 4 hours (14,400 seconds), and output the formatted string `"YYYY-MM-DD"`.

### 2.3 Prayer Time Calculation (Adhan)
*   The current app uses the JavaScript `adhan` library.
*   **C++ Task:** We must either port the `adhan-js` mathematical algorithms to C++, or use an existing C++ astronomical library. 
*   **Core Math:** Sun declination, equation of time, solar transit, and zenith angles based on Latitude/Longitude.
*   **Adjustments:** Must fully support `CalculationMethod` (MoonsightingCommittee, MuslimWorldLeague, etc.) and `Madhab` (Shafi vs Hanafi shadow lengths for Asr).

---

## 3. Platform Bridge Layer
### 3.1 Android JNI
*   Write a JNI wrapper (e.g. `WaqtBridge.cpp`) that exposes C++ classes to Kotlin.
*   **Data Serialization:** Pass complex structures (like the 105-day history graph) across the JNI bridge as serialized JSON strings or carefully mapped JNI objects to avoid memory leaks.
*   **Callbacks:** The C++ core should be able to trigger a callback to Kotlin (e.g. "Refresh UI" or "Schedule Notification").

---

## 4. UI Layer: Jetpack Compose (Android)
The UI must be visually spectacular and deeply integrated with Android OS aesthetics.

### 4.1 Material You & Theming
*   **Dynamic Colors:** Use `dynamicDarkColorScheme()` and `dynamicLightColorScheme()` from Material 3.
*   **Custom Palettes:** Translate the fallback hex codes (`constants/Colors.ts`) into Compose `darkColorScheme` and `lightColorScheme` definitions for users who select non-Material You options.
*   **Animations:** Implement subtle `animateColorAsState` for smooth transitions when users change themes in the settings.

### 4.2 Perfecting Micro-Interactions (Zero Compromises)
*   **Checkboxes:** The native Jetpack Compose `Checkbox` has a strict 48x48dp minimum touch target. To maintain our current slim card design, use `Modifier.minimumInteractiveComponentSize()` or negative offset constraints to match the current React Native `-12dp` fix.
*   **Ripple Effects:** React Native has issues with ripples spilling out of rounded borders. In Compose, ensure `Modifier.clip(RoundedCornerShape(12.dp))` is applied **before** `Modifier.clickable()` on all color cards and habit rows to guarantee perfectly clipped ripples.
*   **Typography Aligment:** Continue using the `\u2007` (figure space) hack or native tabular numbers (`fontFeatureSettings = "tnum"`) to ensure time strings like " 5:30 PM" and "11:30 PM" align perfectly in columns.

### 4.3 Screen-by-Screen Breakdown
*   **Home Screen:** 
    *   App Icon centered at the top (migrated from Expo assets to Android `res/mipmap` and loaded as a `Painter`).
    *   List of 5 cards with start/end times and the checkbox.
*   **Streak/History Screen:** 
    *   105-day GitHub-style contribution graph.
    *   C++ Core will pass up a 2D array representing `weeks -> days`. Compose will render nested `Row`s and `Column`s.
*   **Settings Screen:**
    *   Segmented buttons for Time Display.
    *   Grid of theme color options.
    *   Native dropdowns (`ExposedDropdownMenuBox`) for Calculation Method and Madhab.
    *   Red "Danger Zone" delete button with confirmation dialog.

---

## 5. OS Integrations (Kotlin implementations triggered by C++)

### 5.1 Notifications
*   **The Logic:** C++ calculates exactly *when* the user should be reminded (Prayer End Time minus User Offset). It hands a list of timestamps back to Kotlin.
*   **The Execution:** Kotlin uses `AlarmManager` with `setExactAndAllowWhileIdle()` for precise scheduling (since WorkManager is too inexact for time-sensitive prayer alarms). 
*   **The Receiver:** A `BroadcastReceiver` wakes up, builds a `NotificationCompat.Builder`, and posts it to the Android Notification tray.
*   **Rescheduling:** Hook into `Application.ActivityLifecycleCallbacks` (onAppForegrounded) to ask C++ to recalculate and pass new alarms to `AlarmManager`.

### 5.2 Location
*   Use Android's `FusedLocationProviderClient` to get Latitude/Longitude.
*   Pass these coordinates through JNI into the C++ `PrayerTimesCalculator`.

---

## 6. Development Milestones
1.  **Phase 1: C++ Core Validation:** Write the C++ models, JSON storage logic, Date shift logic, and Adhan math. Validate with C++ Unit Tests (e.g. GoogleTest).
2.  **Phase 2: Android Bridge & OS Systems:** Implement JNI, Location fetching, and AlarmManager notification scheduling.
3.  **Phase 3: Compose UI:** Build the Jetpack Compose screens, tightly adhering to the Material 3 design spec.
4.  **Phase 4: Polish & Parity Check:** Rigorous side-by-side comparison with the existing React Native app to ensure zero pixel or functionality regressions.
