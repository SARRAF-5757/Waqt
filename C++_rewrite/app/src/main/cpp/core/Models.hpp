// Data models for the Waqt engine

#ifndef WAQT_MODELS_HPP
#define WAQT_MODELS_HPP

#include <string>
#include <vector>
#include <map>
#include <cstdint>
#include <chrono>

namespace waqt {

/**
 * Geographic coordinates representation
 */
struct Coordinates {
    double latitude{0.0};
    double longitude{0.0};
};

/**
 * Standard Prayer calculation methods
 */
enum class CalculationMethod {
    MoonsightingCommittee,
    MuslimWorldLeague,
    Egyptian,
    Karachi,
    UmmAlQura,
    Dubai,
    NorthAmerica,
    Kuwait,
    Qatar,
    Singapore,
    Turkey,
    Tehran
};

/**
 * Methods for Asr shadow ratio calculation depending on Madhab
 */
enum class Madhab {
    Shafi,  // (Shafi, Maliki, and Hanbali)
    Hanafi
};

/**
 * User settings stored in persistence layer
 */
struct PreferenceSettings {
    bool showStartTime{true};
    bool showEndTime{true};
    std::string calculationMethod{"NorthAmerica"};
    std::string madhab{"hanafi"};
    std::string themeColor{"#007AFF"};
    int endTimeOffset{15};
    double latitude{0.0};
    double longitude{0.0};
    bool hasLocation{false};
};

/**
 * Start and end time points for all 5 prayers (in UNIX timestamp seconds)
 */
struct PrayerTimesMap {
    int64_t fajr{0};
    int64_t fajrEnd{0};    // Sunrise
    int64_t dhuhr{0};
    int64_t dhuhrEnd{0};   // Asr
    int64_t asr{0};
    int64_t asrEnd{0};     // Maghrib
    int64_t maghrib{0};
    int64_t maghribEnd{0}; // Isha
    int64_t isha{0};
    int64_t ishaEnd{0};    // Middle of the night
    bool isValid{false};
};

/**
 * Represents a scheduled notification item
 */
struct NotificationIntent {
    std::string id;
    std::string title;
    std::string body;
    int64_t triggerTimestampSec{0};
};

/**
 * Daily prayer completion status for a specific dateKey
 */
struct DayPrayerStatus {
    std::string dateKey;
    bool fajr{false};
    bool fajrOnTime{false};
    bool dhuhr{false};
    bool dhuhrOnTime{false};
    bool asr{false};
    bool asrOnTime{false};
    bool maghrib{false};
    bool maghribOnTime{false};
    bool isha{false};
    bool ishaOnTime{false};
};

/**
 * 105-day contribution streak data for each prayer
 */
struct PrayerStreak {
    std::string prayerId;
    std::vector<bool> completionGrid;
    std::vector<bool> onTimeGrid;
};

struct StreakGridData {
    int totalDays{105};
    std::vector<PrayerStreak> streaks;
};

/**
 * Prayer Names (also used as Identifiers)
 */
inline const std::vector<std::string> PRAYER_NAMES = {"Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"};

/**
 * UI representation of a single prayer card
 */
struct UIPrayerItem {
    std::string id;
    std::string name;
    std::string startTimeStr;
    std::string endTimeStr;
    int64_t startTime{0};
    int64_t endTime{0};
    bool isCompleted{false};
    bool isOnTime{false};
};

/**
 * Full state required for the Home Screen UI
 */
struct UIHomeState {
    std::string dateKey;
    std::vector<UIPrayerItem> prayers;
    bool showStartTime{true};
    bool showEndTime{true};
};

} // namespace waqt

#endif // WAQT_MODELS_HPP
