// SQLite database wrapper for persistent prayer data

#include "Database.hpp"
#include "sqlite3.h"
#include <iostream>
#include <sstream>
#include <ctime>
#include <map>

namespace waqt {

// constructors and destructors
Database::Database() = default;
Database::~Database() {
    close();
}

/**
 * INTERNAL: helper to initialize the database schema
 */
void Database::createTables() {
    if (!m_db) return;
    const char* sqlPrefs =
            "CREATE TABLE IF NOT EXISTS preferences ("
            "  key TEXT PRIMARY KEY, "
            "  value TEXT"
            ");";

    const char* sqlHistory =
            "CREATE TABLE IF NOT EXISTS history ("
            "  date_key TEXT, "
            "  prayer_id TEXT, "
            "  completed INTEGER, "
            "  PRIMARY KEY (date_key, prayer_id)"
            ");";

    char* errMsgs = nullptr;
    sqlite3_exec(m_db, sqlPrefs, nullptr, nullptr, &errMsgs);
    if (errMsgs)
        sqlite3_free(errMsgs);

    sqlite3_exec(m_db, sqlHistory, nullptr, nullptr, &errMsgs);
    if (errMsgs)
        sqlite3_free(errMsgs);
}

/**
 * Opens the SQLite database connection at the specified path
 */
bool Database::open(const std::string& dbPath) {
    if (m_db)
        close();
    int rc = sqlite3_open(dbPath.c_str(), &m_db);
    if (rc != SQLITE_OK) {
        if (m_db) {
            sqlite3_close(m_db);
            m_db = nullptr;
        }
        return false;
    }
    createTables();
    return true;
}

/**
 * Closes the SQLite database connection
 */
void Database::close() {
    if (m_db) {
        sqlite3_close(m_db);
        m_db = nullptr;
    }
}

/**
 * Retrieves a single string preference by its key
 */
std::string Database::getPreference(const std::string& key, const std::string& defaultValue) {
    if (!m_db)
        return defaultValue;
    const char* sql = "SELECT value FROM preferences WHERE key = ?;";
    sqlite3_stmt* stmt = nullptr;
    std::string result = defaultValue;

    if (sqlite3_prepare_v2(m_db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, key.c_str(), -1, SQLITE_TRANSIENT);
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            const unsigned char* val = sqlite3_column_text(stmt, 0);
            if (val) {
                result = reinterpret_cast<const char*>(val);
            }
        }
    }
    if (stmt)
        sqlite3_finalize(stmt);
    return result;
}

/**
 * Inserts or updates a single string preference
 */
void Database::setPreference(const std::string& key, const std::string& value) {
    if (!m_db)
        return;
    const char* sql = "INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?);";
    sqlite3_stmt* stmt = nullptr;

    if (sqlite3_prepare_v2(m_db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, key.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, value.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_step(stmt);
    }
    if (stmt)
        sqlite3_finalize(stmt);
}

/**
 * Loads all user preference settings into a data struct
 */
PreferenceSettings Database::getPreferences() {
    PreferenceSettings prefs;
    prefs.showStartTime = (getPreference("showStartTime", "true") == "true");
    prefs.showEndTime = (getPreference("showEndTime", "true") == "true");
    prefs.calculationMethod = getPreference("calculationMethod", "MoonsightingCommittee");
    prefs.madhab = getPreference("madhab", "shafi");
    prefs.themeColor = getPreference("themeColor", "Material You");
    prefs.endTimeOffset = std::stoi(getPreference("endTimeOffset", "15"));
    prefs.latitude = std::stod(getPreference("latitude", "0.0"));
    prefs.longitude = std::stod(getPreference("longitude", "0.0"));
    prefs.hasLocation = (getPreference("hasLocation", "false") == "true");
    return prefs;
}

/**
 * Saves the entire preference settings struct to the database
 */
void Database::savePreferences(const PreferenceSettings& prefs) {
    setPreference("showStartTime", prefs.showStartTime ? "true" : "false");
    setPreference("showEndTime", prefs.showEndTime ? "true" : "false");
    setPreference("calculationMethod", prefs.calculationMethod);
    setPreference("madhab", prefs.madhab);
    setPreference("themeColor", prefs.themeColor);
    setPreference("endTimeOffset", std::to_string(prefs.endTimeOffset));
    setPreference("latitude", std::to_string(prefs.latitude));
    setPreference("longitude", std::to_string(prefs.longitude));
    setPreference("hasLocation", prefs.hasLocation ? "true" : "false");
}

/**
 * Checks if a specific prayer was marked as completed on a given date
 */
bool Database::isPrayerCompleted(const std::string& dateKey, const std::string& prayerId) {
    if (!m_db)
        return false;
    const char* sql = "SELECT completed FROM history WHERE date_key = ? AND prayer_id = ?;";
    sqlite3_stmt* stmt = nullptr;
    bool completed = false;

    if (sqlite3_prepare_v2(m_db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, dateKey.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, prayerId.c_str(), -1, SQLITE_TRANSIENT);
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            completed = (sqlite3_column_int(stmt, 0) != 0);
        }
    }
    if (stmt)
        sqlite3_finalize(stmt);
    return completed;
}

/**
 * Set the completion status of a prayer for a specific date
 */
void Database::setPrayerCompleted(const std::string& dateKey, const std::string& prayerId, bool completed) {
    if (!m_db)
        return;
    const char* sql = "INSERT OR REPLACE INTO history (date_key, prayer_id, completed) VALUES (?, ?, ?);";
    sqlite3_stmt* stmt = nullptr;

    if (sqlite3_prepare_v2(m_db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, dateKey.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, prayerId.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_int(stmt, 3, completed ? 1 : 0);
        sqlite3_step(stmt);
    }
    if (stmt)
        sqlite3_finalize(stmt);
}

/**
 * Returns the completion status of all prayers for a given date
 */
DayPrayerStatus Database::getStatusesForDate(const std::string& dateKey) {
    DayPrayerStatus status;
    status.dateKey = dateKey;
    status.fajr = isPrayerCompleted(dateKey, "Fajr");
    status.dhuhr = isPrayerCompleted(dateKey, "Dhuhr");
    status.asr = isPrayerCompleted(dateKey, "Asr");
    status.maghrib = isPrayerCompleted(dateKey, "Maghrib");
    status.isha = isPrayerCompleted(dateKey, "Isha");
    return status;
}

/**
 * Compiles completion data into a streak grid format using a single query
 */
StreakGridData Database::getStreakData(const std::string& todayDateKey) {
    StreakGridData gridData;
    gridData.totalDays = 105;

    // Parse todayDateKey YYYY-MM-DD
    int year = 2025, month = 1, day = 1;
    std::sscanf(todayDateKey.c_str(), "%d-%d-%d", &year, &month, &day);

    std::tm tmToday{};
    tmToday.tm_year = year - 1900;
    tmToday.tm_mon = month - 1;
    tmToday.tm_mday = day;
    time_t todayTime = timegm(&tmToday);

    // Calculate threshold date key (104 days ago)
    time_t thresholdTime = todayTime - (104 * 86400);
    std::tm tmThresholdStruct;
    std::tm* tmThreshold = gmtime_r(&thresholdTime, &tmThresholdStruct);
    char thresholdBuf[32];
    std::strftime(thresholdBuf, sizeof(thresholdBuf), "%Y-%m-%d", tmThreshold);
    std::string thresholdDateKey(thresholdBuf);

    // Query all records in the last 105 days in one go
    std::map<std::string, std::map<std::string, bool>> historyMap;
    if (m_db) {
        const char* sql = "SELECT date_key, prayer_id, completed FROM history WHERE date_key >= ?;";
        sqlite3_stmt* stmt = nullptr;
        if (sqlite3_prepare_v2(m_db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_text(stmt, 1, thresholdDateKey.c_str(), -1, SQLITE_TRANSIENT);
            while (sqlite3_step(stmt) == SQLITE_ROW) {
                const unsigned char* dk = sqlite3_column_text(stmt, 0);
                const unsigned char* pi = sqlite3_column_text(stmt, 1);
                if (dk && pi) {
                    std::string dKey(reinterpret_cast<const char*>(dk));
                    std::string pId(reinterpret_cast<const char*>(pi));
                    bool completed = (sqlite3_column_int(stmt, 2) != 0);
                    historyMap[dKey][pId] = completed;
                }
            }
        }
        if (stmt) sqlite3_finalize(stmt);
    }

    // Build the grids from the cached map
    for (const auto& prayerId : PRAYER_NAMES) {
        PrayerStreak streak;
        streak.prayerId = prayerId;
        streak.completionGrid.resize(105, false);

        for (int i = 0; i < 105; ++i) {
            int daysBack = 104 - i; // Index 0 is 104 days ago
            time_t targetTime = todayTime - (daysBack * 86400);
            std::tm tmTargetStruct;
            std::tm* tmTarget = gmtime_r(&targetTime, &tmTargetStruct);
            char buf[32];
            std::strftime(buf, sizeof(buf), "%Y-%m-%d", tmTarget);
            std::string dKey(buf);

            auto itDate = historyMap.find(dKey);
            if (itDate != historyMap.end()) {
                auto itPrayer = itDate->second.find(prayerId);
                if (itPrayer != itDate->second.end()) {
                    streak.completionGrid[i] = itPrayer->second;
                }
            }
        }
        gridData.streaks.push_back(streak);
    }

    return gridData;
}

/**
 * Wipes all records from the database
 */
void Database::deleteAllHistory() {
    if (!m_db)
        return;
    const char* sql = "DELETE FROM history;";
    char* errMsgs = nullptr;
    sqlite3_exec(m_db, sql, nullptr, nullptr, &errMsgs);
    if (errMsgs)
        sqlite3_free(errMsgs);
}

} // namespace waqt
