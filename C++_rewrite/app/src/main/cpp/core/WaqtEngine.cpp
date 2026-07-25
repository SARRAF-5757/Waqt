#include "WaqtEngine.hpp"
#include "PrayerCalculator.hpp"
#include "FajrShiftDate.hpp"
#include "NotificationGenerator.hpp"
#include <ctime>

namespace waqt {

WaqtEngine& WaqtEngine::getInstance() {
    static WaqtEngine instance;
    return instance;
}

bool WaqtEngine::initialize(const std::string& dbPath) {
    return m_database.open(dbPath);
}

void WaqtEngine::setLocation(double latitude, double longitude) {
    PreferenceSettings prefs = m_database.getPreferences();
    prefs.latitude = latitude;
    prefs.longitude = longitude;
    prefs.hasLocation = true;
    m_database.savePreferences(prefs);
}

PreferenceSettings WaqtEngine::getPreferences() {
    return m_database.getPreferences();
}

void WaqtEngine::updatePreference(const std::string& key, const std::string& value) {
    m_database.setPreference(key, value);
}

PrayerTimesMap WaqtEngine::getTodayPrayerTimes(int64_t nowUnixTimestampSec) {
    PreferenceSettings prefs = m_database.getPreferences();
    if (!prefs.hasLocation) {
        return PrayerTimesMap{};
    }

    std::time_t t = static_cast<std::time_t>(nowUnixTimestampSec);
    std::tm* localTm = std::localtime(&t);
    if (!localTm) return PrayerTimesMap{};

    int year = localTm->tm_year + 1900;
    int month = localTm->tm_mon + 1;
    int day = localTm->tm_mday;

    CalculationMethod method = PrayerCalculator::parseCalculationMethod(prefs.calculationMethod);
    Madhab madhab = PrayerCalculator::parseMadhab(prefs.madhab);

    PrayerTimesMap map = PrayerCalculator::calculatePrayerTimes(year, month, day, prefs.latitude, prefs.longitude, method, madhab);
    
    // Synchronize Fajr cutoff globally
    FajrShiftDate::setFajrCutoffFromTimestamp(map.fajr);

    return map;
}

DayPrayerStatus WaqtEngine::getTodayStatuses(int64_t nowUnixTimestampSec) {
    // Ensure Fajr cutoff is refreshed
    getTodayPrayerTimes(nowUnixTimestampSec);
    std::string todayKey = FajrShiftDate::getDateKey(nowUnixTimestampSec);
    return m_database.getStatusesForDate(todayKey);
}

bool WaqtEngine::togglePrayerStatus(const std::string& dateKey, const std::string& prayerId, bool completed) {
    m_database.setPrayerCompleted(dateKey, prayerId, completed);
    return completed;
}

StreakGridData WaqtEngine::getStreakData(int64_t nowUnixTimestampSec) {
    getTodayPrayerTimes(nowUnixTimestampSec);
    std::string todayKey = FajrShiftDate::getDateKey(nowUnixTimestampSec);
    return m_database.getStreakData(todayKey);
}

void WaqtEngine::deleteAllHistory() {
    m_database.deleteAllHistory();
}

std::vector<NotificationIntent> WaqtEngine::getNotificationSchedule(int64_t nowUnixTimestampSec) {
    PreferenceSettings prefs = m_database.getPreferences();
    if (!prefs.hasLocation) return {};

    CalculationMethod method = PrayerCalculator::parseCalculationMethod(prefs.calculationMethod);
    Madhab madhab = PrayerCalculator::parseMadhab(prefs.madhab);

    return NotificationGenerator::generateSchedule(
        nowUnixTimestampSec,
        prefs.latitude, prefs.longitude,
        prefs.endTimeOffset,
        method, madhab,
        m_database
    );
}

} // namespace waqt
