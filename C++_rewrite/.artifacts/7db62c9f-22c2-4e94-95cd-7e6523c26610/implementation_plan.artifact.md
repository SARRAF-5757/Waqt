# Fix OutOfMemoryError in Gradle Build

The project is failing to build with a `java.lang.OutOfMemoryError: Java heap space` during the `:app:mergeExtDexDebug` task. This task is memory-intensive as it merges dex files from external libraries. The current Gradle configuration does not explicitly set a heap size, likely defaulting to a value too small for this project.

## Proposed Changes

### Build Configuration

#### [MODIFY] [gradle.properties](file:///Users/sarraf-temp/Coding/Waqt/C++_rewrite/gradle.properties)

Add `org.gradle.jvmargs` to increase the maximum heap size allocated to the Gradle daemon.

```properties
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g -Dfile.encoding=UTF-8
```

- `-Xmx4g`: Increases the maximum heap size to 4GB.
- `-XX:MaxMetaspaceSize=1g`: Increases the metaspace size (where class metadata is stored).
- `-Dfile.encoding=UTF-8`: Ensures consistent file encoding.

## Verification Plan

### Manual Verification
1. Run the failing Gradle task again:
   ```bash
   ./gradlew :app:mergeExtDexDebug
   ```
2. Verify that the build completes successfully without the `OutOfMemoryError`.
