#ifndef WAQT_MODELS_HPP
#define WAQT_MODELS_HPP

#include <string>
#include <vector>
#include <map>
#include <cstdint>
#include <chrono>

namespace waqt {

/**
 * Geographic coordinates representation.
 */
struct Coordinates {
    double latitude{0.0};
    double longitude{0.0};
};

/**
 * Standard Islamic calculation methods.
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
 * Madhab rules for Asr shadow ratio calculation.
 */
enum class Madhab {
    Shafi,  // Shadow factor 1 (Shafi, Maliki, Hanbali)
    Hanafi  // Shadow factor 2
};

/**
 * User settings stored in persistence layer.
 */
struct PreferenceSettings {
    bool showStartTime{true};
    bool showEndTime{true};
    std::string calculationMethod{"MoonsightingCommittee"};
    std::string madhab{"shafi"};
    std::string themeColor{"#007AFF"};
    int endTimeOffset{15};
    double latitude{0.0};
    double longitude{0.0};
    bool hasLocation{false};
};

/**
 * Start and end time points for the 5 daily prayers (in UNIX timestamp seconds).
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
 * Represents a scheduled notification item.
 */
struct NotificationIntent {
    std::string id;
    std::string title;
    std::string body;
    int64_t triggerTimestampSec{0};
};

/**
 * Daily prayer completion status for a specific dateKey (YYYY-MM-DD).
 */
struct DayPrayerStatus {
    std::string dateKey;
    bool fajr{false};
    bool dhuhr{false};
    bool asr{false};
    bool maghrib{false};
    bool isha{false};
};

/**
 * 105-day contribution streak data for each prayer.
 */
struct PrayerStreak {
    std::string prayerId;
    std::vector<bool> completionGrid; // 105 elements (false/true)
};

struct StreakGridData {
    int totalDays{105};
    std::vector<PrayerStreak> streaks;
};

} // namespace waqt

#endif // WAQT_MODELS_HPP
