// Main engine class coordinating calculations and data flow

#include "WaqtEngine.hpp"
#include "PrayerCalculator.hpp"
#include "FajrShiftDate.hpp"
#include "NotificationGenerator.hpp"
#include <ctime>

namespace waqt {

/**
 * Get the singleton of WaqtEngine
 */
WaqtEngine& WaqtEngine::getInstance() {
    static WaqtEngine instance;
    return instance;
}

/**
 * Initializes the engine and opens the SQLite database at the given path
 */
bool WaqtEngine::initialize(const std::string& dbPath) {
    return m_database.open(dbPath);
}

/**
 * Updates the geographic coordinates and saves them to preferences
 */
void WaqtEngine::setLocation(double latitude, double longitude) {
    PreferenceSettings prefs = m_database.getPreferences();
    prefs.latitude = latitude;
    prefs.longitude = longitude;
    prefs.hasLocation = true;
    m_database.savePreferences(prefs);
}

/**
 * Retrieves the current user preference settings from the database
 */
PreferenceSettings WaqtEngine::getPreferences() {
    return m_database.getPreferences();
}

/**
 * Updates a single preference value in the database
 */
void WaqtEngine::updatePreference(const std::string& key, const std::string& value) {
    m_database.setPreference(key, value);
}

/**
 * Calculates start/end times for the 5 prayers for the day
 */
PrayerTimesMap WaqtEngine::getTodayPrayerTimes(int64_t nowUnixTimestampSec) {
    PreferenceSettings prefs = m_database.getPreferences();
    if (!prefs.hasLocation) {
        return PrayerTimesMap{};
    }

    auto t = static_cast<std::time_t>(nowUnixTimestampSec);
    std::tm localTmStruct;
    std::tm* localTm = localtime_r(&t, &localTmStruct);
    if (!localTm)
        return PrayerTimesMap{};

    int year = localTm->tm_year + 1900;
    int month = localTm->tm_mon + 1;
    int day = localTm->tm_mday;

    PrayerTimesMap map = PrayerCalculator::calculatePrayerTimes(year, month, day, prefs);
    
    // Synchronize Fajr cutoff globally
    FajrShiftDate::setFajrCutoffFromTimestamp(map.fajr);

    return map;
}

/**
 * Returns the completion status for each prayer today
 */
DayPrayerStatus WaqtEngine::getTodayStatuses(int64_t nowUnixTimestampSec) {
    // Ensure Fajr cutoff is refreshed
    getTodayPrayerTimes(nowUnixTimestampSec);
    std::string todayKey = FajrShiftDate::getDateKey(nowUnixTimestampSec);
    return m_database.getStatusesForDate(todayKey);
}

static std::string formatTime(int64_t timestamp) {
    if (timestamp <= 0)
        return "--:--";
    auto t = static_cast<std::time_t>(timestamp);
    std::tm localTmStruct;
    std::tm* localTm = localtime_r(&t, &localTmStruct);
    if (!localTm)
        return "--:--";
    char buffer[16];
    // Format: "h:mm AM/PM"
    std::strftime(buffer, sizeof(buffer), "%l:%M %p", localTm);
    return {buffer};
}

/**
 * Generates a ready-to-display state for the Home UI
 */
UIHomeState WaqtEngine::getUIHomeState(int64_t nowUnixTimestampSec) {
    PrayerTimesMap times = getTodayPrayerTimes(nowUnixTimestampSec);
    std::string todayKey = FajrShiftDate::getDateKey(nowUnixTimestampSec);
    DayPrayerStatus status = m_database.getStatusesForDate(todayKey);
    PreferenceSettings prefs = m_database.getPreferences();

    UIHomeState uiState;
    uiState.dateKey = status.dateKey;
    uiState.showStartTime = prefs.showStartTime;
    uiState.showEndTime = prefs.showEndTime;

    // Iterate through the global source of truth for prayer names
    for (const auto& name : PRAYER_NAMES) {
        UIPrayerItem item;
        item.id = name;
        item.name = name;

        // Map the raw C++ timestamps and status bits to the UI item
        if (name == "Fajr") {
            item.startTimeStr = formatTime(times.fajr);
            item.endTimeStr = formatTime(times.fajrEnd);
            item.startTime = times.fajr;
            item.endTime = times.fajrEnd;
            item.isCompleted = status.fajr;
            item.isOnTime = status.fajrOnTime;
        } else if (name == "Dhuhr") {
            item.startTimeStr = formatTime(times.dhuhr);
            item.endTimeStr = formatTime(times.dhuhrEnd);
            item.startTime = times.dhuhr;
            item.endTime = times.dhuhrEnd;
            item.isCompleted = status.dhuhr;
            item.isOnTime = status.dhuhrOnTime;
        } else if (name == "Asr") {
            item.startTimeStr = formatTime(times.asr);
            item.endTimeStr = formatTime(times.asrEnd);
            item.startTime = times.asr;
            item.endTime = times.asrEnd;
            item.isCompleted = status.asr;
            item.isOnTime = status.asrOnTime;
        } else if (name == "Maghrib") {
            item.startTimeStr = formatTime(times.maghrib);
            item.endTimeStr = formatTime(times.maghribEnd);
            item.startTime = times.maghrib;
            item.endTime = times.maghribEnd;
            item.isCompleted = status.maghrib;
            item.isOnTime = status.maghribOnTime;
        } else if (name == "Isha") {
            item.startTimeStr = formatTime(times.isha);
            item.endTimeStr = formatTime(times.ishaEnd);
            item.startTime = times.isha;
            item.endTime = times.ishaEnd;
            item.isCompleted = status.isha;
            item.isOnTime = status.ishaOnTime;
        }

        uiState.prayers.push_back(item);
    }

    return uiState;
}

/**
 * Toggles a prayer's completion status in the history database
 */
bool WaqtEngine::togglePrayerStatus(const std::string& dateKey, const std::string& prayerId, bool completed, bool isOnTime) {
    m_database.setPrayerCompleted(dateKey, prayerId, completed, isOnTime);
    return completed;
}

/**
 * Returns completion grid for all prayers over a specific date range
 */
StreakGridData WaqtEngine::getRangeGridData(const std::string& startDateKey, const std::string& endDateKey) {
    return m_database.getRangeGridData(startDateKey, endDateKey);
}

/**
 * Returns statistics for all prayers over a specific date range
 */
HistoryStatsData WaqtEngine::getRangeStats(const std::string& startDateKey, const std::string& endDateKey) {
    return m_database.getRangeStats(startDateKey, endDateKey);
}

/**
 * Wipes all prayer completion history from the database
 */
void WaqtEngine::deleteAllHistory() {
    m_database.deleteAllHistory();
}

/**
 * Generates a sorted list of upcoming prayer and end-time warning notifications
 */
std::vector<NotificationIntent> WaqtEngine::getNotificationSchedule(int64_t nowUnixTimestampSec) {
    PreferenceSettings prefs = m_database.getPreferences();
    if (!prefs.hasLocation)
        return {};

    return NotificationGenerator::generateSchedule(
        nowUnixTimestampSec,
        prefs,
        m_database
    );
}

/**
 * Calculates and returns option preview labels with formatted timestamps for the UI
 */
EndOptionPreviews WaqtEngine::getEndOptionPreviews(int64_t nowUnixTimestampSec) {
    EndOptionPreviews previews;
    PreferenceSettings prefs = m_database.getPreferences();

    // Default dropdown labels without timestamps
    previews.maghribOptions = {
        "Tied to Isha",
        "Red Twilight (14°)",
        "White Twilight (18°)",
        "Fixed Minutes"
    };
    previews.ishaOptions = {
        "Islamic Midnight (Sunset to Fajr)",
        "First Third of Night",
        "Astronomical Midnight (Sunset to Sunrise)",
        "Tied to Fajr Start"
    };

    if (!prefs.hasLocation) {
        return previews;
    }

    auto t = static_cast<std::time_t>(nowUnixTimestampSec);
    std::tm localTmStruct;
    std::tm* localTm = localtime_r(&t, &localTmStruct);
    if (!localTm) return previews;
    
    int year = localTm->tm_year + 1900;
    int month = localTm->tm_mon + 1;
    int day = localTm->tm_mday;

    auto calcWithMode = [&](const std::string& maghribMode, const std::string& ishaMode) {
        PreferenceSettings tempPrefs = prefs;
        tempPrefs.maghribEndMode = maghribMode;
        if (maghribMode == "RED_TWILIGHT") tempPrefs.maghribEndCustomAngle = 14.0;
        if (maghribMode == "WHITE_TWILIGHT") tempPrefs.maghribEndCustomAngle = 18.0;
        tempPrefs.ishaEndMode = ishaMode;
        
        return PrayerCalculator::calculatePrayerTimes(year, month, day, tempPrefs);
    };

    // Calculate Maghrib previews
    PrayerTimesMap tiedToIsha = calcWithMode("TIED_TO_ISHA", prefs.ishaEndMode);
    PrayerTimesMap redTwilight = calcWithMode("RED_TWILIGHT", prefs.ishaEndMode);
    PrayerTimesMap whiteTwilight = calcWithMode("WHITE_TWILIGHT", prefs.ishaEndMode);
    PrayerTimesMap fixedMinutes = calcWithMode("FIXED_MINUTES", prefs.ishaEndMode);

    previews.maghribOptions[0] += " (" + formatTime(tiedToIsha.maghribEnd) + ")";
    previews.maghribOptions[1] += " (" + formatTime(redTwilight.maghribEnd) + ")";
    previews.maghribOptions[2] += " (" + formatTime(whiteTwilight.maghribEnd) + ")";
    previews.maghribOptions[3] += " (" + formatTime(fixedMinutes.maghribEnd) + ")";

    // Calculate Isha previews
    PrayerTimesMap islamicMidnight = calcWithMode(prefs.maghribEndMode, "ISLAMIC_MIDNIGHT");
    PrayerTimesMap firstThird = calcWithMode(prefs.maghribEndMode, "FIRST_THIRD");
    PrayerTimesMap astronomicalMidnight = calcWithMode(prefs.maghribEndMode, "ASTRONOMICAL_MIDNIGHT");
    PrayerTimesMap tiedToFajr = calcWithMode(prefs.maghribEndMode, "FAJR_START");

    previews.ishaOptions[0] += " (" + formatTime(islamicMidnight.ishaEnd) + ")";
    previews.ishaOptions[1] += " (" + formatTime(firstThird.ishaEnd) + ")";
    previews.ishaOptions[2] += " (" + formatTime(astronomicalMidnight.ishaEnd) + ")";
    previews.ishaOptions[3] += " (" + formatTime(tiedToFajr.ishaEnd) + ")";

    return previews;
}

} // namespace waqt
