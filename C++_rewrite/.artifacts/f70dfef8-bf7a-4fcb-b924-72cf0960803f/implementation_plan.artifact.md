# Fix Gradle Sync Error: Redundant Kotlin Plugin in AGP 9.0

The project is using Android Gradle Plugin (AGP) 9.3.1, which includes built-in Kotlin support. Manually applying the `org.jetbrains.kotlin.android` plugin causes a conflict as both AGP and the Kotlin plugin attempt to register the `kotlin` extension.

## Proposed Changes

### Root Project Configuration

#### [MODIFY] [build.gradle.kts](file:///Users/sarraf-temp/Coding/Waqt/C++_rewrite/build.gradle.kts)
- Remove the `org.jetbrains.kotlin.android` plugin from the `plugins` block. AGP 9.0 handles Kotlin support natively.

### App Module Configuration

#### [MODIFY] [build.gradle.kts](file:///Users/sarraf-temp/Coding/Waqt/C++_rewrite/app/build.gradle.kts)
- Remove `id("org.jetbrains.kotlin.android")` from the `plugins` block.
- Migrate `android.kotlinOptions` to the new `kotlin.compilerOptions` block provided by AGP 9.0.

## Verification Plan

### Automated Tests
- Run Gradle sync to verify that the "Cannot add extension with name 'kotlin'" error is resolved.
- Run `./gradlew :app:assembleDebug` to ensure the project still builds correctly with built-in Kotlin support.

### Manual Verification
- Verify that Kotlin code completion and IDE features still work as expected in the `app` module.
