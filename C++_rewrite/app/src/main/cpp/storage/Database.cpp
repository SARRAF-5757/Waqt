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
            "  is_on_time INTEGER DEFAULT 0, "
            "  PRIMARY KEY (date_key, prayer_id)"
            ");";

    char* errMsgs = nullptr;
    sqlite3_exec(m_db, sqlPrefs, nullptr, nullptr, &errMsgs);
    if (errMsgs)
        sqlite3_free(errMsgs);

    sqlite3_exec(m_db, sqlHistory, nullptr, nullptr, &errMsgs);
    if (errMsgs)
        sqlite3_free(errMsgs);

    sqlite3_exec(m_db, "PRAGMA user_version = 1;", nullptr, nullptr, nullptr);
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
std::pair<bool, bool> Database::isPrayerCompleted(const std::string& dateKey, const std::string& prayerId) {
    if (!m_db)
        return {false, false};
    const char* sql = "SELECT completed, is_on_time FROM history WHERE date_key = ? AND prayer_id = ?;";
    sqlite3_stmt* stmt = nullptr;
    bool completed = false;
    bool isOnTime = false;

    if (sqlite3_prepare_v2(m_db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, dateKey.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, prayerId.c_str(), -1, SQLITE_TRANSIENT);
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            completed = (sqlite3_column_int(stmt, 0) != 0);
            isOnTime = (sqlite3_column_int(stmt, 1) != 0);
        }
    }
    if (stmt)
        sqlite3_finalize(stmt);
    return {completed, isOnTime};
}

/**
 * Set the completion status of a prayer for a specific date
 */
void Database::setPrayerCompleted(const std::string& dateKey, const std::string& prayerId, bool completed, bool isOnTime) {
    if (!m_db)
        return;
    const char* sql = "INSERT OR REPLACE INTO history (date_key, prayer_id, completed, is_on_time) VALUES (?, ?, ?, ?);";
    sqlite3_stmt* stmt = nullptr;

    if (sqlite3_prepare_v2(m_db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, dateKey.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, prayerId.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_int(stmt, 3, completed ? 1 : 0);
        sqlite3_bind_int(stmt, 4, isOnTime ? 1 : 0);
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

    auto updateStatus = [&](const std::string& pId, bool& completed, bool& isOnTime) {
        auto res = isPrayerCompleted(dateKey, pId);
        completed = res.first;
        isOnTime = res.second;
    };

    updateStatus("Fajr", status.fajr, status.fajrOnTime);
    updateStatus("Dhuhr", status.dhuhr, status.dhuhrOnTime);
    updateStatus("Asr", status.asr, status.asrOnTime);
    updateStatus("Maghrib", status.maghrib, status.maghribOnTime);
    updateStatus("Isha", status.isha, status.ishaOnTime);

    return status;
}

/**
 * Compiles completion data into a streak grid format for a specific range
 */
StreakGridData Database::getRangeGridData(const std::string& startDateKey, const std::string& endDateKey) {
    StreakGridData gridData;

    int sY, sM, sD, eY, eM, eD;
    std::sscanf(startDateKey.c_str(), "%d-%d-%d", &sY, &sM, &sD);
    std::sscanf(endDateKey.c_str(), "%d-%d-%d", &eY, &eM, &eD);

    std::tm tmStart{}, tmEnd{};
    tmStart.tm_year = sY - 1900;
    tmStart.tm_mon = sM - 1;
    tmStart.tm_mday = sD;
    tmEnd.tm_year = eY - 1900;
    tmEnd.tm_mon = eM - 1;
    tmEnd.tm_mday = eD;

    time_t startTime = timegm(&tmStart);
    time_t endTime = timegm(&tmEnd);

    int numDays = static_cast<int>((endTime - startTime) / 86400) + 1;
    gridData.totalDays = numDays;

    // Query all records in the requested range in one go
    std::map<std::string, std::map<std::string, std::pair<bool, bool>>> historyMap;
    if (m_db) {
        const char* sql = "SELECT date_key, prayer_id, completed, is_on_time FROM history WHERE date_key >= ? AND date_key <= ?;";
        sqlite3_stmt* stmt = nullptr;
        if (sqlite3_prepare_v2(m_db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_text(stmt, 1, startDateKey.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 2, endDateKey.c_str(), -1, SQLITE_TRANSIENT);
            while (sqlite3_step(stmt) == SQLITE_ROW) {
                const unsigned char* dk = sqlite3_column_text(stmt, 0);
                const unsigned char* pi = sqlite3_column_text(stmt, 1);
                if (dk && pi) {
                    std::string dKey(reinterpret_cast<const char*>(dk));
                    std::string pId(reinterpret_cast<const char*>(pi));
                    bool completed = (sqlite3_column_int(stmt, 2) != 0);
                    bool isOnTime = (sqlite3_column_int(stmt, 3) != 0);
                    historyMap[dKey][pId] = {completed, isOnTime};
                }
            }
        }
        if (stmt) sqlite3_finalize(stmt);
    }

    // Build the grids from the cached map
    for (const auto& prayerId : PRAYER_NAMES) {
        PrayerStreak streak;
        streak.prayerId = prayerId;
        streak.completionGrid.resize(numDays, false);
        streak.onTimeGrid.resize(numDays, false);

        for (int i = 0; i < numDays; ++i) {
            time_t targetTime = startTime + (i * 86400LL);
            std::tm tmTargetStruct;
            std::tm* tmTarget = gmtime_r(&targetTime, &tmTargetStruct);
            char buf[32];
            std::strftime(buf, sizeof(buf), "%Y-%m-%d", tmTarget);
            std::string dKey(buf);

            auto itDate = historyMap.find(dKey);
            if (itDate != historyMap.end()) {
                auto itPrayer = itDate->second.find(prayerId);
                if (itPrayer != itDate->second.end()) {
                    streak.completionGrid[i] = itPrayer->second.first;
                    streak.onTimeGrid[i] = itPrayer->second.second;
                }
            }
        }
        gridData.streaks.push_back(streak);
    }

    return gridData;
}

/**
 * Calculates aggregate statistics for a specific range
 */
HistoryStatsData Database::getRangeStats(const std::string& startDateKey, const std::string& endDateKey) {
    HistoryStatsData statsData;

    int sY, sM, sD, eY, eM, eD;
    std::sscanf(startDateKey.c_str(), "%d-%d-%d", &sY, &sM, &sD);
    std::sscanf(endDateKey.c_str(), "%d-%d-%d", &eY, &eM, &eD);

    std::tm tmStart{}, tmEnd{};
    tmStart.tm_year = sY - 1900; tmStart.tm_mon = sM - 1; tmStart.tm_mday = sD;
    tmEnd.tm_year = eY - 1900; tmEnd.tm_mon = eM - 1; tmEnd.tm_mday = eD;

    time_t startTime = timegm(&tmStart);
    time_t endTime = timegm(&tmEnd);
    int numDays = static_cast<int>((endTime - startTime) / 86400LL) + 1;
    statsData.totalDays = numDays;

    for (const auto& prayerId : PRAYER_NAMES) {
        PrayerStats pStats;
        pStats.prayerId = prayerId;

        if (m_db) {
            const char* sql = "SELECT COUNT(*), SUM(is_on_time) FROM history "
                              "WHERE prayer_id = ? AND completed = 1 AND date_key >= ? AND date_key <= ?;";
            sqlite3_stmt* stmt = nullptr;
            if (sqlite3_prepare_v2(m_db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
                sqlite3_bind_text(stmt, 1, prayerId.c_str(), -1, SQLITE_TRANSIENT);
                sqlite3_bind_text(stmt, 2, startDateKey.c_str(), -1, SQLITE_TRANSIENT);
                sqlite3_bind_text(stmt, 3, endDateKey.c_str(), -1, SQLITE_TRANSIENT);
                if (sqlite3_step(stmt) == SQLITE_ROW) {
                    int completedCount = sqlite3_column_int(stmt, 0);
                    pStats.onTimeCount = sqlite3_column_int(stmt, 1);
                    pStats.lateCount = completedCount - pStats.onTimeCount;
                    pStats.missedCount = std::max(0, numDays - completedCount);
                }
            }
            if (stmt) sqlite3_finalize(stmt);
        }
        statsData.stats.push_back(pStats);
    }
    return statsData;
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
