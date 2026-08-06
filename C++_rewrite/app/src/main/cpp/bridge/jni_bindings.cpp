// JNI bridge between Kotlin and the C++ Waqt engine

#include <jni.h>
#include "../core/WaqtEngine.hpp"
#include "../core/FajrShiftDate.hpp"
#include <string>
#include <vector>

// Global cache for JNI class and method IDs
struct {
    jclass prayerItemClass;
    jmethodID prayerItemCons;
    jclass homeStateClass;
    jmethodID homeStateCons;
    jclass prefsSettingsClass;
    jmethodID prefsSettingsCons;
    jclass streakGridDataClass;
    jmethodID streakGridDataCons;
    jclass prayerStreakClass;
    jmethodID prayerStreakCons;
    jclass prayerStatsClass;
    jmethodID prayerStatsCons;
    jclass historyStatsDataClass;
    jmethodID historyStatsDataCons;
    jclass notificationIntentClass;
    jmethodID notificationIntentCons;
    jclass arrayListClass;
    jmethodID arrayListCons;
    jmethodID arrayListAdd;
} g_cache;

static jobject createArrayList(JNIEnv* env, jint capacity) {
    return env->NewObject(g_cache.arrayListClass, g_cache.arrayListCons, capacity);
}

static void addToArrayList(JNIEnv* env, jobject list, jobject item) {
    env->CallBooleanMethod(list, g_cache.arrayListAdd, item);
}

extern "C" {    // to prevent name mangling

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {
    JNIEnv* env;
    if (vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6) != JNI_OK) {
        return JNI_ERR;
    }

    auto cacheClass = [&](const char* name, jclass& outCls, jmethodID& outCons, const char* sig) {
        jclass local = env->FindClass(name);
        outCls = (jclass)env->NewGlobalRef(local);
        outCons = env->GetMethodID(outCls, "<init>", sig);
        env->DeleteLocalRef(local);
    };

    jclass arrayListLocal = env->FindClass("java/util/ArrayList");
    g_cache.arrayListClass = (jclass)env->NewGlobalRef(arrayListLocal);
    g_cache.arrayListCons = env->GetMethodID(g_cache.arrayListClass, "<init>", "(I)V");
    g_cache.arrayListAdd = env->GetMethodID(g_cache.arrayListClass, "add", "(Ljava/lang/Object;)Z");
    env->DeleteLocalRef(arrayListLocal);

    cacheClass("io/github/sarraf5757/waqt/bridge/NativeModels$UIPrayerItem",
               g_cache.prayerItemClass, g_cache.prayerItemCons,
               "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;JJZZ)V");

    cacheClass("io/github/sarraf5757/waqt/bridge/NativeModels$HomeState",
               g_cache.homeStateClass, g_cache.homeStateCons,
               "(Ljava/lang/String;Ljava/util/List;ZZ)V");

    cacheClass("io/github/sarraf5757/waqt/bridge/NativeModels$PreferenceSettings",
               g_cache.prefsSettingsClass, g_cache.prefsSettingsCons,
               "(ZZLjava/lang/String;Ljava/lang/String;Ljava/lang/String;IDDZLjava/lang/String;Ljava/lang/String;)V");

    cacheClass("io/github/sarraf5757/waqt/bridge/NativeModels$StreakGridData",
               g_cache.streakGridDataClass, g_cache.streakGridDataCons,
               "(ILjava/util/List;)V");

    cacheClass("io/github/sarraf5757/waqt/bridge/NativeModels$PrayerStreak",
               g_cache.prayerStreakClass, g_cache.prayerStreakCons,
               "(Ljava/lang/String;[Z[Z)V");

    cacheClass("io/github/sarraf5757/waqt/bridge/NativeModels$PrayerStats",
               g_cache.prayerStatsClass, g_cache.prayerStatsCons,
               "(Ljava/lang/String;III)V");

    cacheClass("io/github/sarraf5757/waqt/bridge/NativeModels$HistoryStatsData",
               g_cache.historyStatsDataClass, g_cache.historyStatsDataCons,
               "(ILjava/util/List;)V");

    cacheClass("io/github/sarraf5757/waqt/bridge/NativeModels$NotificationIntent",
               g_cache.notificationIntentClass, g_cache.notificationIntentCons,
               "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;J)V");

    return JNI_VERSION_1_6;
}

/**
 * JNI FUNCTION NAMING CONVENTION:
 * Java_<PackageName>_<ClassName>_<MethodName>
 *
 * JNIEnv* env: The primary interface to the JVM (used for object allocation, etc.)
 * jobject thiz: The instance of the Kotlin object that called this function
 */
JNIEXPORT jboolean JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeInitialize(JNIEnv* env, jobject /*thiz*/, jstring dbPath) {
    if (!dbPath)
        return JNI_FALSE;

    const char* pathStr = env->GetStringUTFChars(dbPath, nullptr);
    std::string path(pathStr ? pathStr : "");
    if (pathStr)
        env->ReleaseStringUTFChars(dbPath, pathStr);

    return waqt::WaqtEngine::getInstance().initialize(path) ? JNI_TRUE : JNI_FALSE;
}

JNIEXPORT void JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeUpdateLocation(JNIEnv* /*env*/, jobject /*thiz*/, jdouble lat, jdouble lng) {
    waqt::WaqtEngine::getInstance().setLocation(lat, lng);
}

/**
 * Reconstructs a Kotlin 'HomeState' data class using C++ data
 */
JNIEXPORT jobject JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeGetHomeState(JNIEnv* env, jobject /*thiz*/, jlong nowSec) {
    auto uiState = waqt::WaqtEngine::getInstance().getUIHomeState(nowSec);

    // Create an ArrayList of objects to pass back to Kotlin
    jobject prayersList = createArrayList(env, static_cast<jint>(uiState.prayers.size()));
    for (size_t i = 0; i < uiState.prayers.size(); ++i) {
        const auto& p = uiState.prayers[i];
        jstring idStr = env->NewStringUTF(p.id.c_str());
        jstring nameStr = env->NewStringUTF(p.name.c_str());
        jstring startStr = env->NewStringUTF(p.startTimeStr.c_str());
        jstring endStr = env->NewStringUTF(p.endTimeStr.c_str());

        // Instantiate the Kotlin UIPrayerItem object using cached constructor
        jobject itemObj = env->NewObject(
            g_cache.prayerItemClass, g_cache.prayerItemCons,
            idStr, nameStr, startStr, endStr,
            static_cast<jlong>(p.startTime),
            static_cast<jlong>(p.endTime),
            p.isCompleted ? JNI_TRUE : JNI_FALSE,
            p.isOnTime ? JNI_TRUE : JNI_FALSE
        );
        addToArrayList(env, prayersList, itemObj);

        // cleanup of local references
        env->DeleteLocalRef(idStr);
        env->DeleteLocalRef(nameStr);
        env->DeleteLocalRef(startStr);
        env->DeleteLocalRef(endStr);
        env->DeleteLocalRef(itemObj);
    }

    jstring dateKeyStr = env->NewStringUTF(uiState.dateKey.c_str());

    // Construct the final HomeState object using cached values
    jobject result = env->NewObject(
        g_cache.homeStateClass, g_cache.homeStateCons,
        dateKeyStr,
        prayersList,
        uiState.showStartTime ? JNI_TRUE : JNI_FALSE,
        uiState.showEndTime ? JNI_TRUE : JNI_FALSE
    );

    env->DeleteLocalRef(dateKeyStr);
    env->DeleteLocalRef(prayersList);
    return result;
}

/**
 * Persists a checkbox change to the C++ SQLite database
 */
JNIEXPORT jboolean JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeTogglePrayer(
    JNIEnv* env, jobject /*thiz*/, jstring dateKey, jstring prayerId, jboolean completed, jboolean isOnTime
) {
    if (!dateKey || !prayerId)
        return JNI_FALSE;
    const char* dKeyStr = env->GetStringUTFChars(dateKey, nullptr);
    const char* pIdStr = env->GetStringUTFChars(prayerId, nullptr);

    bool res = waqt::WaqtEngine::getInstance().togglePrayerStatus(
        dKeyStr ? dKeyStr : "",
        pIdStr ? pIdStr : "",
        completed == JNI_TRUE,
        isOnTime == JNI_TRUE
    );

    if (dKeyStr)
        env->ReleaseStringUTFChars(dateKey, dKeyStr);
    if (pIdStr)
        env->ReleaseStringUTFChars(prayerId, pIdStr);

    return res ? JNI_TRUE : JNI_FALSE;
}

/**
 * Retrieves the current user preference settings from the C++ database
 */
JNIEXPORT jobject JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeGetPreferences(JNIEnv* env, jobject /*thiz*/) {
    waqt::PreferenceSettings prefs = waqt::WaqtEngine::getInstance().getPreferences();

    jstring calcStr = env->NewStringUTF(prefs.calculationMethod.c_str());
    jstring madhabStr = env->NewStringUTF(prefs.madhab.c_str());
    jstring themeStr = env->NewStringUTF(prefs.themeColor.c_str());
    jstring mvStr = env->NewStringUTF(prefs.historyMajorView.c_str());
    jstring grStr = env->NewStringUTF(prefs.historyGranularity.c_str());

    jobject result = env->NewObject(
        g_cache.prefsSettingsClass, g_cache.prefsSettingsCons,
        prefs.showStartTime ? JNI_TRUE : JNI_FALSE,
        prefs.showEndTime ? JNI_TRUE : JNI_FALSE,
        calcStr, madhabStr, themeStr,
        prefs.endTimeOffset,
        prefs.latitude, prefs.longitude,
        prefs.hasLocation ? JNI_TRUE : JNI_FALSE,
        mvStr, grStr
    );

    env->DeleteLocalRef(calcStr);
    env->DeleteLocalRef(madhabStr);
    env->DeleteLocalRef(themeStr);
    env->DeleteLocalRef(mvStr);
    env->DeleteLocalRef(grStr);

    return result;
}

/**
 * Updates a single preference value in the C++ SQLite database
 */
JNIEXPORT void JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeUpdatePreference(
    JNIEnv* env, jobject /*thiz*/, jstring key, jstring value
) {
    if (!key || !value) return;
    const char* kStr = env->GetStringUTFChars(key, nullptr);
    const char* vStr = env->GetStringUTFChars(value, nullptr);

    waqt::WaqtEngine::getInstance().updatePreference(
        kStr ? kStr : "",
        vStr ? vStr : ""
    );

    if (kStr) env->ReleaseStringUTFChars(key, kStr);
    if (vStr) env->ReleaseStringUTFChars(value, vStr);
}

/**
 * Wipes all prayer completion history from the C++ database
 */
JNIEXPORT void JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeDeleteAllHistory(JNIEnv* /*env*/, jobject /*thiz*/) {
    waqt::WaqtEngine::getInstance().deleteAllHistory();
}

/**
 * Returns a completion grid used to render streak graphs for a specific date range
 */
JNIEXPORT jobject JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeGetRangeGridData(JNIEnv* env, jobject /*thiz*/, jstring startDate, jstring endDate) {
    const char* sStr = env->GetStringUTFChars(startDate, nullptr);
    const char* eStr = env->GetStringUTFChars(endDate, nullptr);
    waqt::StreakGridData gridData = waqt::WaqtEngine::getInstance().getRangeGridData(sStr ? sStr : "", eStr ? eStr : "");
    if (sStr) env->ReleaseStringUTFChars(startDate, sStr);
    if (eStr) env->ReleaseStringUTFChars(endDate, eStr);

    jobject streaksList = createArrayList(env, static_cast<jint>(gridData.streaks.size()));

    for (size_t i = 0; i < gridData.streaks.size(); ++i) {
        const auto& s = gridData.streaks[i];
        jstring pIdStr = env->NewStringUTF(s.prayerId.c_str());

        jbooleanArray boolArr = env->NewBooleanArray(s.completionGrid.size());
        std::vector<jboolean> tempBools(s.completionGrid.begin(), s.completionGrid.end());
        env->SetBooleanArrayRegion(boolArr, 0, tempBools.size(), tempBools.data());

        jbooleanArray onTimeArr = env->NewBooleanArray(s.onTimeGrid.size());
        std::vector<jboolean> tempOnTime(s.onTimeGrid.begin(), s.onTimeGrid.end());
        env->SetBooleanArrayRegion(onTimeArr, 0, tempOnTime.size(), tempOnTime.data());

        jobject streakObj = env->NewObject(g_cache.prayerStreakClass, g_cache.prayerStreakCons, pIdStr, boolArr, onTimeArr);
        addToArrayList(env, streaksList, streakObj);

        env->DeleteLocalRef(pIdStr);
        env->DeleteLocalRef(boolArr);
        env->DeleteLocalRef(onTimeArr);
        env->DeleteLocalRef(streakObj);
    }

    jobject result = env->NewObject(g_cache.streakGridDataClass, g_cache.streakGridDataCons, gridData.totalDays, streaksList);
    env->DeleteLocalRef(streaksList);

    return result;
}

/**
 * Returns statistics for all prayers over a specific date range
 */
JNIEXPORT jobject JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeGetRangeStats(JNIEnv* env, jobject /*thiz*/, jstring startDate, jstring endDate) {
    const char* sStr = env->GetStringUTFChars(startDate, nullptr);
    const char* eStr = env->GetStringUTFChars(endDate, nullptr);
    waqt::HistoryStatsData statsData = waqt::WaqtEngine::getInstance().getRangeStats(sStr ? sStr : "", eStr ? eStr : "");
    if (sStr) env->ReleaseStringUTFChars(startDate, sStr);
    if (eStr) env->ReleaseStringUTFChars(endDate, eStr);

    jobject statsList = createArrayList(env, static_cast<jint>(statsData.stats.size()));

    for (size_t i = 0; i < statsData.stats.size(); ++i) {
        const auto& s = statsData.stats[i];
        jstring pIdStr = env->NewStringUTF(s.prayerId.c_str());

        jobject statObj = env->NewObject(g_cache.prayerStatsClass, g_cache.prayerStatsCons, pIdStr, s.onTimeCount, s.lateCount, s.missedCount);
        addToArrayList(env, statsList, statObj);

        env->DeleteLocalRef(pIdStr);
        env->DeleteLocalRef(statObj);
    }

    jobject result = env->NewObject(g_cache.historyStatsDataClass, g_cache.historyStatsDataCons, statsData.totalDays, statsList);
    env->DeleteLocalRef(statsList);

    return result;
}

/**
 * Generates a sorted list of upcoming prayer notifications to be scheduled by the Android OS
 */
JNIEXPORT jobject JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeGetNotificationSchedule(JNIEnv* env, jobject /*thiz*/, jlong nowSec) {
    auto intents = waqt::WaqtEngine::getInstance().getNotificationSchedule(nowSec);

    jobject resultList = createArrayList(env, static_cast<jint>(intents.size()));

    for (size_t i = 0; i < intents.size(); ++i) {
        const auto& item = intents[i];
        jstring idStr = env->NewStringUTF(item.id.c_str());
        jstring titleStr = env->NewStringUTF(item.title.c_str());
        jstring bodyStr = env->NewStringUTF(item.body.c_str());

        jobject obj = env->NewObject(g_cache.notificationIntentClass, g_cache.notificationIntentCons, idStr, titleStr, bodyStr, static_cast<jlong>(item.triggerTimestampSec));
        addToArrayList(env, resultList, obj);

        env->DeleteLocalRef(idStr);
        env->DeleteLocalRef(titleStr);
        env->DeleteLocalRef(bodyStr);
        env->DeleteLocalRef(obj);
    }

    return resultList;
}

} // extern "C"
