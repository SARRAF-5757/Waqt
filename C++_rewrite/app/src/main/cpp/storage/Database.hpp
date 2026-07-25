#ifndef WAQT_DATABASE_HPP
#define WAQT_DATABASE_HPP

#include "../core/Models.hpp"
#include <string>
#include <vector>

struct sqlite3;

namespace waqt {

class Database {
public:
    Database();
    ~Database();

    bool open(const std::string& dbPath);
    void close();

    std::string getPreference(const std::string& key, const std::string& defaultValue);
    void setPreference(const std::string& key, const std::string& value);

    PreferenceSettings getPreferences();
    void savePreferences(const PreferenceSettings& prefs);

    bool isPrayerCompleted(const std::string& dateKey, const std::string& prayerId);
    void setPrayerCompleted(const std::string& dateKey, const std::string& prayerId, bool completed);

    DayPrayerStatus getStatusesForDate(const std::string& dateKey);
    StreakGridData getStreakData(const std::string& todayDateKey);

    void deleteAllHistory();

private:
    sqlite3* m_db{nullptr};
    void createTables();
};

} // namespace waqt

#endif // WAQT_DATABASE_HPP
