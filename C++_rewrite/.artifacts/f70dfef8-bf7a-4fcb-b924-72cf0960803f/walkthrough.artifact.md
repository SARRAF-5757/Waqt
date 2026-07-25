# Walkthrough: Fixed Redundant Kotlin Plugin Conflict

The "Cannot add extension with name 'kotlin'" error was caused by a conflict between the manually applied `org.jetbrains.kotlin.android` plugin and the new built-in Kotlin support introduced in **Android Gradle Plugin (AGP) 9.0**.

## Changes

### Build Configuration

#### [build.gradle.kts](file:///Users/sarraf-temp/Coding/Waqt/C++_rewrite/build.gradle.kts)
- Removed the redundant `org.jetbrains.kotlin.android` plugin declaration.

#### [app/build.gradle.kts](file:///Users/sarraf-temp/Coding/Waqt/C++_rewrite/app/build.gradle.kts)
- Removed the manual application of `id("org.jetbrains.kotlin.android")`.
- Removed the legacy `kotlinOptions` block. In AGP 9.0, Kotlin compilation is managed automatically, and settings like `jvmTarget` now default to the values set in `android.compileOptions`.

## Verification Results

### Gradle Sync
- [x] **Success**: The project now syncs without the "Cannot add extension with name 'kotlin'" exception.

### Compilation
- [x] **Kotlin**: Ran `./gradlew :app:compileDebugKotlin` successfully.
- [x] **C++**: Ran `./gradlew :app:externalNativeBuildDebug` successfully.
- [x] **Clean**: Ran `./gradlew clean` successfully.

> [!NOTE]
> The project successfully compiles both Kotlin and C++ components. The built-in Kotlin support in AGP 9.0 automatically inherits configuration from your existing `android` block, ensuring consistency across the project.
