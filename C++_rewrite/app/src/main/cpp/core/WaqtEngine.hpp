// Main engine class coordinating calculations and data flow

#ifndef WAQT_ENGINE_HPP
#define WAQT_ENGINE_HPP

#include "Models.hpp"
#include "../storage/Database.hpp"
#include <string>
#include <vector>

namespace waqt {

class WaqtEngine {
private:
    WaqtEngine() = default;
    ~WaqtEngine() = default;
    WaqtEngine(const WaqtEngine&) = delete;
    WaqtEngine& operator=(const WaqtEngine&) = delete;

    Database m_database;
public:
    /**
     * Get the singleton of WaqtEngine
     */
    static WaqtEngine& getInstance();

    /**
     * Initializes the engine and opens the SQLite database at the given path
     */
    bool initialize(const std::string& dbPath);
    
    /**
     * Updates the geographic coordinates and saves them to preferences
     */
    void setLocation(double latitude, double longitude);

    /**
     * Retrieves the current user preference settings from the database
     */
    PreferenceSettings getPreferences();

    /**
     * Updates a single preference value in the database
     */
    void updatePreference(const std::string& key, const std::string& value);

    /**
     * Calculates start/end times for the 5 prayers for the day
     */
    PrayerTimesMap getTodayPrayerTimes(int64_t nowUnixTimestampSec);

    /**
     * Returns the completion status for each prayer today
     */
    DayPrayerStatus getTodayStatuses(int64_t nowUnixTimestampSec);

    /**
     * Generates a ready-to-display state for the Home UI
     */
    UIHomeState getUIHomeState(int64_t nowUnixTimestampSec);

    /**
     * Toggles a prayer's completion status in the history database
     */
    bool togglePrayerStatus(const std::string& dateKey, const std::string& prayerId, bool completed, bool isOnTime);

    /**
     * Returns completion grid for all prayers over a specific date range
     */
    StreakGridData getRangeGridData(const std::string& startDateKey, const std::string& endDateKey);

    /**
     * Returns statistics for all prayers over a specific date range
     */
    HistoryStatsData getRangeStats(const std::string& startDateKey, const std::string& endDateKey);

    /**
     * Wipes all prayer completion history from the database
     */
    void deleteAllHistory();

    /**
     * Generates a sorted list of upcoming prayer and end-time warning notifications
     */
    std::vector<NotificationIntent> getNotificationSchedule(int64_t nowUnixTimestampSec);
};

} // namespace waqt

#endif // WAQT_ENGINE_HPP
