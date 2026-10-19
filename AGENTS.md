## Project Context

Waqt is a greenfield Native Android application with a C++ core for prayer tracking, built from scratch to replace a legacy React Native app. It features a UI built in Jetpack Compose, a JNI bridge, and core business logic (astronomical calculations, persistence, and date logic) in pure C++20. There is no React Native, Expo, or JavaScript code.

## Stack

**Languages:**
- Kotlin (Jetpack Compose, MVVM)
- C++20 (Core math and logic)
- C (SQLite)

**Frameworks & Tools:**
- Jetpack Compose (Material 3)
- JNI (Java Native Interface)
- SQLiteCpp / sqlite3
- CMake & Android NDK

## Architecture

The project strictly follows a 3-layer architecture:

1. **Layer 1 (UI - Kotlin/Compose):** Located in `app/src/main/java/io/github/sarraf5757/waqt/`. Very simple, declarative UI. Uses ViewModel + `StateFlow` to reactively update the UI based on JNI callbacks or polling. Handles OS integrations like `AlarmManager` for notifications and `FusedLocationProviderClient` for location.
2. **Layer 2 (Bridge - JNI):** Located in `app/src/main/cpp/bridge/`. Thin adapter only. No business logic. Marshals data between Kotlin and C++.
3. **Layer 3 (Core - C++20):** Located in `app/src/main/cpp/core/` and `app/src/main/cpp/storage/`. Platform-agnostic (no `<jni.h>` in core headers). Handles dates, prayer math (`PrayerCalculator`), SQLite persistence (`Database`), notification schedule computation (`WaqtEngine`), and domain rules (e.g., Fajr-shift date logic).

## Key Design Rules & Concepts

- **Fajr-Shift Date Logic:** A "day" runs until the *next day's Fajr*, not midnight. Users logging late Isha after midnight count toward the previous day. Managed by `WaqtEngine`.
- **Configurable Maghrib & Isha End Times:**
  - *Maghrib End Modes:* `TIED_TO_ISHA` (default), `RED_TWILIGHT` (14°), `WHITE_TWILIGHT` (18°), and `FIXED_MINUTES` (configurable offset). If the astronomical twilight hour angle calculation fails (e.g., extreme latitudes in summer returning NaN / out-of-range cosine), the engine automatically falls back to `FIXED_MINUTES`.
  - *Isha End Modes:* `ISLAMIC_MIDNIGHT` (midpoint between Sunset and next Fajr), `FIRST_THIRD` (one-third of night between Sunset and next Fajr), `ASTRONOMICAL_MIDNIGHT` (midpoint between Sunset and next Sunrise), and `FAJR_START` (tied directly to next Fajr).
- **Core-Driven UI Previews:** Option preview labels with formatted times (e.g., "Red Twilight (14°) (7:52 PM)") are computed directly in C++ via `WaqtEngine::getEndOptionPreviews` and returned via `EndOptionPreviews` rather than formatted in Kotlin. If location is missing (`hasLocation == false`), labels are returned without timestamps to avoid displaying times for (0, 0) coordinates.
- **Preference Extension Pattern (Full-Stack Checklist):** The SQLite `preferences` table is a generic Key-Value store. Adding or modifying settings requires updating all 3 layers:
  1. *Layer 3 (Core):* Update `PreferenceSettings` struct in `app/src/main/cpp/core/Models.hpp` and SQLite serialization/deserialization in `app/src/main/cpp/storage/Database.cpp` (`getPreferences()` and `savePreferences()`).
  2. *Layer 2 (Bridge):* Update constructor signature cache in `JNI_OnLoad` and JNI object creation in `Java_..._nativeGetPreferences` within `app/src/main/cpp/bridge/jni_bindings.cpp`. Also update `NativeModels.PreferenceSettings` data class in `NativeModels.kt`.
  3. *Layer 1 (UI):* Expose setters in `SettingsViewModel.kt` (using the generic `WaqtNativeBridge.updatePreference(key, value)`) and connect UI components in `SettingsScreen.kt`.
- **C++ Core Independence:** Core logic stays in C++ without platform-specific headers to allow potential future iOS reusability.
- **Kotlin Simplicity:** Write the Android UI layer as simply as possible. Prefer explicit step-by-step code over clever abstractions. Use clear names (`schedulePrayerEndNotification`, not `schedEnd`).
- **Comments & Documentation:**
  - *File Headers:* Every file starts with a concise 1-line description of its role or purpose (e.g. `// Main engine class coordinating calculations and data flow`).
  - *Function & Component Docstrings:* Every function, composable, and data struct gets a concise 1-2 line doc comment (`/** ... */`) summarizing what it accomplishes in clear, plain language (e.g. `/** Updates preference and reschedules notification queue */`). Avoid verbose academic templates (no RME blocks).
  - *Inline Comments:* Use inline comments sparingly to explain non-obvious domain logic, formulas, fallbacks, or hardware/OS interop details.
- **Data Persistence:** Uses SQLite via C++ wrappers. No JSON files or SharedPreferences for core history logic.
- **Notifications:** C++ computes notification timings (start and end/waqt time). Kotlin owns scheduling using Android's `AlarmManager` (Exact Alarms) and `BroadcastReceiver`.

## Boundaries

**Always:**
- Run existing tests before committing changes.
- Follow the 3-layer architecture (UI -> Bridge -> Core).
- Adhere to the codebase's documentation standards (1-line file headers, concise function docblocks).
- Implement new mathematical or date logic in the C++ core, not Kotlin.

**Ask first:**
- Adding new dependencies (especially in the C++ core).
- Changing the JNI boundary surface area or `PreferenceSettings` JNI signature.
- Changing project configuration files or modifying CMakeLists.txt.

**Never:**
- Commit secrets, API keys, or .env files.
- Put business logic or complex state management in the JNI bridge.
- Reference or port code from old JavaScript libraries.

<!-- agentseed:meta {"sha":"702764f9ef8482987b320a54a8053ccea6d213f9","timestamp":"2026-09-26T03:16:27.568Z","format":"agentseed-v1"} -->
