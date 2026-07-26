#include <jni.h>
#include "../core/WaqtEngine.hpp"
#include "../core/FajrShiftDate.hpp"
#include <string>
#include <vector>

extern "C" {

JNIEXPORT jboolean JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeInitialize(JNIEnv* env, jobject /*thiz*/, jstring dbPath) {
    if (!dbPath) return JNI_FALSE;
    const char* pathStr = env->GetStringUTFChars(dbPath, nullptr);
    std::string path(pathStr ? pathStr : "");
    if (pathStr) env->ReleaseStringUTFChars(dbPath, pathStr);

    return waqt::WaqtEngine::getInstance().initialize(path) ? JNI_TRUE : JNI_FALSE;
}

JNIEXPORT void JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeUpdateLocation(JNIEnv* /*env*/, jobject /*thiz*/, jdouble lat, jdouble lng) {
    waqt::WaqtEngine::getInstance().setLocation(lat, lng);
}

JNIEXPORT jobject JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeGetHomeState(JNIEnv* env, jobject /*thiz*/, jlong nowSec) {
    auto& engine = waqt::WaqtEngine::getInstance();
    waqt::PrayerTimesMap times = engine.getTodayPrayerTimes(nowSec);
    waqt::DayPrayerStatus status = engine.getTodayStatuses(nowSec);
    waqt::PreferenceSettings prefs = engine.getPreferences();

    jclass homeStateClass = env->FindClass("io/github/sarraf5757/waqt/bridge/NativeModels$HomeState");
    if (!homeStateClass) return nullptr;

    jmethodID constructor = env->GetMethodID(homeStateClass, "<init>", "(Ljava/lang/String;ZZZZZJJJJJJJJJJZZ)V");
    if (!constructor) return nullptr;

    jstring dateKeyStr = env->NewStringUTF(status.dateKey.c_str());

    jobject result = env->NewObject(
        homeStateClass, constructor,
        dateKeyStr,
        status.fajr ? JNI_TRUE : JNI_FALSE,
        status.dhuhr ? JNI_TRUE : JNI_FALSE,
        status.asr ? JNI_TRUE : JNI_FALSE,
        status.maghrib ? JNI_TRUE : JNI_FALSE,
        status.isha ? JNI_TRUE : JNI_FALSE,
        static_cast<jlong>(times.fajr),
        static_cast<jlong>(times.fajrEnd),
        static_cast<jlong>(times.dhuhr),
        static_cast<jlong>(times.dhuhrEnd),
        static_cast<jlong>(times.asr),
        static_cast<jlong>(times.asrEnd),
        static_cast<jlong>(times.maghrib),
        static_cast<jlong>(times.maghribEnd),
        static_cast<jlong>(times.isha),
        static_cast<jlong>(times.ishaEnd),
        prefs.showStartTime ? JNI_TRUE : JNI_FALSE,
        prefs.showEndTime ? JNI_TRUE : JNI_FALSE
    );

    env->DeleteLocalRef(dateKeyStr);
    return result;
}

JNIEXPORT jboolean JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeTogglePrayer(
    JNIEnv* env, jobject /*thiz*/, jstring dateKey, jstring prayerId, jboolean completed
) {
    if (!dateKey || !prayerId) return JNI_FALSE;
    const char* dKeyStr = env->GetStringUTFChars(dateKey, nullptr);
    const char* pIdStr = env->GetStringUTFChars(prayerId, nullptr);

    bool res = waqt::WaqtEngine::getInstance().togglePrayerStatus(
        dKeyStr ? dKeyStr : "",
        pIdStr ? pIdStr : "",
        completed == JNI_TRUE
    );

    if (dKeyStr) env->ReleaseStringUTFChars(dateKey, dKeyStr);
    if (pIdStr) env->ReleaseStringUTFChars(prayerId, pIdStr);

    return res ? JNI_TRUE : JNI_FALSE;
}

JNIEXPORT jobject JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeGetPreferences(JNIEnv* env, jobject /*thiz*/) {
    waqt::PreferenceSettings prefs = waqt::WaqtEngine::getInstance().getPreferences();

    jclass prefsClass = env->FindClass("io/github/sarraf5757/waqt/bridge/NativeModels$PreferenceSettings");
    if (!prefsClass) return nullptr;

    jmethodID constructor = env->GetMethodID(prefsClass, "<init>", "(ZZLjava/lang/String;Ljava/lang/String;Ljava/lang/String;IDDZ)V");
    if (!constructor) return nullptr;

    jstring calcStr = env->NewStringUTF(prefs.calculationMethod.c_str());
    jstring madhabStr = env->NewStringUTF(prefs.madhab.c_str());
    jstring themeStr = env->NewStringUTF(prefs.themeColor.c_str());

    jobject result = env->NewObject(
        prefsClass, constructor,
        prefs.showStartTime ? JNI_TRUE : JNI_FALSE,
        prefs.showEndTime ? JNI_TRUE : JNI_FALSE,
        calcStr, madhabStr, themeStr,
        prefs.endTimeOffset,
        prefs.latitude, prefs.longitude,
        prefs.hasLocation ? JNI_TRUE : JNI_FALSE
    );

    env->DeleteLocalRef(calcStr);
    env->DeleteLocalRef(madhabStr);
    env->DeleteLocalRef(themeStr);

    return result;
}

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

JNIEXPORT void JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeDeleteAllHistory(JNIEnv* /*env*/, jobject /*thiz*/) {
    waqt::WaqtEngine::getInstance().deleteAllHistory();
}

JNIEXPORT jobject JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeGetStreakData(JNIEnv* env, jobject /*thiz*/, jlong nowSec) {
    waqt::StreakGridData gridData = waqt::WaqtEngine::getInstance().getStreakData(nowSec);

    jclass streakDataClass = env->FindClass("io/github/sarraf5757/waqt/bridge/NativeModels$StreakGridData");
    jclass streakItemClass = env->FindClass("io/github/sarraf5757/waqt/bridge/NativeModels$PrayerStreak");
    if (!streakDataClass || !streakItemClass) return nullptr;

    jmethodID streakItemCons = env->GetMethodID(streakItemClass, "<init>", "(Ljava/lang/String;[Z)V");
    jmethodID streakDataCons = env->GetMethodID(streakDataClass, "<init>", "(I[Lio/github/sarraf5757/waqt/bridge/NativeModels$PrayerStreak;)V");
    if (!streakItemCons || !streakDataCons) return nullptr;

    jobjectArray streaksArr = env->NewObjectArray(gridData.streaks.size(), streakItemClass, nullptr);

    for (size_t i = 0; i < gridData.streaks.size(); ++i) {
        const auto& s = gridData.streaks[i];
        jstring pIdStr = env->NewStringUTF(s.prayerId.c_str());

        jbooleanArray boolArr = env->NewBooleanArray(s.completionGrid.size());
        std::vector<jboolean> tempBools(s.completionGrid.begin(), s.completionGrid.end());
        env->SetBooleanArrayRegion(boolArr, 0, tempBools.size(), tempBools.data());

        jobject streakObj = env->NewObject(streakItemClass, streakItemCons, pIdStr, boolArr);
        env->SetObjectArrayElement(streaksArr, i, streakObj);

        env->DeleteLocalRef(pIdStr);
        env->DeleteLocalRef(boolArr);
        env->DeleteLocalRef(streakObj);
    }

    jobject result = env->NewObject(streakDataClass, streakDataCons, gridData.totalDays, streaksArr);
    env->DeleteLocalRef(streaksArr);

    return result;
}

JNIEXPORT jobjectArray JNICALL
Java_io_github_sarraf5757_waqt_bridge_WaqtNativeBridge_nativeGetNotificationSchedule(JNIEnv* env, jobject /*thiz*/, jlong nowSec) {
    auto intents = waqt::WaqtEngine::getInstance().getNotificationSchedule(nowSec);

    jclass intentClass = env->FindClass("io/github/sarraf5757/waqt/bridge/NativeModels$NotificationIntent");
    if (!intentClass) return nullptr;

    jmethodID constructor = env->GetMethodID(intentClass, "<init>", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;J)V");
    if (!constructor) return nullptr;

    jobjectArray resultArr = env->NewObjectArray(intents.size(), intentClass, nullptr);

    for (size_t i = 0; i < intents.size(); ++i) {
        const auto& item = intents[i];
        jstring idStr = env->NewStringUTF(item.id.c_str());
        jstring titleStr = env->NewStringUTF(item.title.c_str());
        jstring bodyStr = env->NewStringUTF(item.body.c_str());

        jobject obj = env->NewObject(intentClass, constructor, idStr, titleStr, bodyStr, static_cast<jlong>(item.triggerTimestampSec));
        env->SetObjectArrayElement(resultArr, i, obj);

        env->DeleteLocalRef(idStr);
        env->DeleteLocalRef(titleStr);
        env->DeleteLocalRef(bodyStr);
        env->DeleteLocalRef(obj);
    }

    return resultArr;
}

} // extern "C"
