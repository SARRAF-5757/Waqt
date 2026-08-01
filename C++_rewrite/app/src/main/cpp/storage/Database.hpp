// SQLite database wrapper for persistent prayer data

#ifndef WAQT_DATABASE_HPP
#define WAQT_DATABASE_HPP

#include "../core/Models.hpp"
#include <string>
#include <vector>

struct sqlite3;

namespace waqt {

class Database {
private:
    sqlite3* m_db{nullptr};
    void createTables();    // INTERNAL: helper to initialize the database schema
public:
    // constructors and destructors
    Database();
    ~Database();

    /**
     * Opens the SQLite database connection at the specified path
     */
    bool open(const std::string& dbPath);

    /**
     * Closes the SQLite database connection
     */
    void close();

    /**
     * Retrieves a single string preference by its key
     */
    std::string getPreference(const std::string& key, const std::string& defaultValue);

    /**
     * Inserts or updates a single string preference
     */
    void setPreference(const std::string& key, const std::string& value);

    /**
     * Loads all user preference settings into a data struct
     */
    PreferenceSettings getPreferences();

    /**
     * Saves the entire preference settings struct to the database
     */
    void savePreferences(const PreferenceSettings& prefs);

    /**
     * Checks if a specific prayer was marked as completed on a given date
     */
    bool isPrayerCompleted(const std::string& dateKey, const std::string& prayerId);

    /**
     * Set the completion status of a prayer for a specific date
     */
    void setPrayerCompleted(const std::string& dateKey, const std::string& prayerId, bool completed);

    /**
     * Returns the completion status of all prayers for a given date
     */
    DayPrayerStatus getStatusesForDate(const std::string& dateKey);

    /**
     * Compiles historical completion data into a streak grid format
     */
    StreakGridData getStreakData(const std::string& todayDateKey);

    /**
     * Wipes all records from the database
     */
    void deleteAllHistory();
};

} // namespace waqt

#endif // WAQT_DATABASE_HPP
