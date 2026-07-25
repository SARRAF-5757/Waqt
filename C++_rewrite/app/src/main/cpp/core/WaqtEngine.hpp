#ifndef WAQT_ENGINE_HPP
#define WAQT_ENGINE_HPP

#include "Models.hpp"
#include "../storage/Database.hpp"
#include <string>
#include <vector>

namespace waqt {

class WaqtEngine {
public:
    static WaqtEngine& getInstance();

    bool initialize(const std::string& dbPath);
    
    void setLocation(double latitude, double longitude);
    PreferenceSettings getPreferences();
    void updatePreference(const std::string& key, const std::string& value);

    PrayerTimesMap getTodayPrayerTimes(int64_t nowUnixTimestampSec);
    DayPrayerStatus getTodayStatuses(int64_t nowUnixTimestampSec);
    bool togglePrayerStatus(const std::string& dateKey, const std::string& prayerId, bool completed);

    StreakGridData getStreakData(int64_t nowUnixTimestampSec);
    void deleteAllHistory();

    std::vector<NotificationIntent> getNotificationSchedule(int64_t nowUnixTimestampSec);

private:
    WaqtEngine() = default;
    ~WaqtEngine() = default;
    WaqtEngine(const WaqtEngine&) = delete;
    WaqtEngine& operator=(const WaqtEngine&) = delete;

    Database m_database;
};

} // namespace waqt

#endif // WAQT_ENGINE_HPP
