#include "Database.hpp"
#include "sqlite3.h"
#include <iostream>
#include <sstream>
#include <ctime>

namespace waqt {

Database::Database() = default;

Database::~Database() {
    close();
}

bool Database::open(const std::string& dbPath) {
    if (m_db) close();
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

void Database::close() {
    if (m_db) {
        sqlite3_close(m_db);
        m_db = nullptr;
    }
}

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
    if (errMsgs) sqlite3_free(errMsgs);

    sqlite3_exec(m_db, sqlHistory, nullptr, nullptr, &errMsgs);
    if (errMsgs) sqlite3_free(errMsgs);
}

std::string Database::getPreference(const std::string& key, const std::string& defaultValue) {
    if (!m_db) return defaultValue;
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
    if (stmt) sqlite3_finalize(stmt);
    return result;
}

void Database::setPreference(const std::string& key, const std::string& value) {
    if (!m_db) return;
    const char* sql = "INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?);";
    sqlite3_stmt* stmt = nullptr;

    if (sqlite3_prepare_v2(m_db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, key.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, value.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_step(stmt);
    }
    if (stmt) sqlite3_finalize(stmt);
}

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

bool Database::isPrayerCompleted(const std::string& dateKey, const std::string& prayerId) {
    if (!m_db) return false;
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
    if (stmt) sqlite3_finalize(stmt);
    return completed;
}

void Database::setPrayerCompleted(const std::string& dateKey, const std::string& prayerId, bool completed) {
    if (!m_db) return;
    const char* sql = "INSERT OR REPLACE INTO history (date_key, prayer_id, completed) VALUES (?, ?, ?);";
    sqlite3_stmt* stmt = nullptr;

    if (sqlite3_prepare_v2(m_db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
        sqlite3_bind_text(stmt, 1, dateKey.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, prayerId.c_str(), -1, SQLITE_TRANSIENT);
        sqlite3_bind_int(stmt, 3, completed ? 1 : 0);
        sqlite3_step(stmt);
    }
    if (stmt) sqlite3_finalize(stmt);
}

DayPrayerStatus Database::getStatusesForDate(const std::string& dateKey) {
    DayPrayerStatus status;
    status.dateKey = dateKey;
    status.fajr = isPrayerCompleted(dateKey, "fajr");
    status.dhuhr = isPrayerCompleted(dateKey, "dhuhr");
    status.asr = isPrayerCompleted(dateKey, "asr");
    status.maghrib = isPrayerCompleted(dateKey, "maghrib");
    status.isha = isPrayerCompleted(dateKey, "isha");
    return status;
}

StreakGridData Database::getStreakData(const std::string& todayDateKey) {
    StreakGridData gridData;
    gridData.totalDays = 105;

    std::vector<std::string> prayerIds = {"fajr", "dhuhr", "asr", "maghrib", "isha"};
    
    // Parse todayDateKey YYYY-MM-DD
    int year = 2025, month = 1, day = 1;
    std::sscanf(todayDateKey.c_str(), "%d-%d-%d", &year, &month, &day);

    std::tm tmToday{};
    tmToday.tm_year = year - 1900;
    tmToday.tm_mon = month - 1;
    tmToday.tm_mday = day;

    #if defined(_WIN32)
    time_t todayTime = _mkgmtime(&tmToday);
    #else
    time_t todayTime = timegm(&tmToday);
    #endif

    for (const auto& prayerId : prayerIds) {
        PrayerStreak streak;
        streak.prayerId = prayerId;
        streak.completionGrid.resize(105, false);

        for (int i = 0; i < 105; ++i) {
            int daysBack = 104 - i; // Index 0 is 104 days ago, index 104 is today
            time_t targetTime = todayTime - (daysBack * 86400);
            std::tm* tmTarget = std::gmtime(&targetTime);
            char buf[32];
            std::strftime(buf, sizeof(buf), "%Y-%m-%d", tmTarget);
            std::string dKey(buf);

            streak.completionGrid[i] = isPrayerCompleted(dKey, prayerId);
        }

        gridData.streaks.push_back(streak);
    }

    return gridData;
}

void Database::deleteAllHistory() {
    if (!m_db) return;
    const char* sql = "DELETE FROM history;";
    char* errMsgs = nullptr;
    sqlite3_exec(m_db, sql, nullptr, nullptr, &errMsgs);
    if (errMsgs) sqlite3_free(errMsgs);
}

} // namespace waqt
