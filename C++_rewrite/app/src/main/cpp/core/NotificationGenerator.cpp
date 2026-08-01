// Logic for generating upcoming prayer notifications

#include "NotificationGenerator.hpp"
#include "PrayerCalculator.hpp"
#include "FajrShiftDate.hpp"
#include <algorithm>
#include <ctime>

namespace waqt {

std::vector<NotificationIntent> NotificationGenerator::generateSchedule(
    int64_t nowUnixTimestampSec,
    double latitude, double longitude,
    int offsetMinutes,
    CalculationMethod method,
    Madhab madhab,
    Database& db
) {
    std::vector<NotificationIntent> schedule;

    for (int dayOffset = 0; dayOffset < 10; ++dayOffset) {
        int64_t targetTimeSec = nowUnixTimestampSec + (static_cast<int64_t>(dayOffset) * 86400LL);
        std::time_t targetTime = static_cast<std::time_t>(targetTimeSec);
        std::tm* localTm = std::localtime(&targetTime);
        if (!localTm)
            continue;

        int year = localTm->tm_year + 1900;
        int month = localTm->tm_mon + 1;
        int day = localTm->tm_mday;

        PrayerTimesMap prayerMap = PrayerCalculator::calculatePrayerTimes(year, month, day, latitude, longitude, method, madhab);
        std::string dateKey = FajrShiftDate::getDateKey(targetTimeSec);

        // Iterate through all prayers using the centralized naming standard.
        for (const auto& name : PRAYER_NAMES) {
            // Skip scheduling notifications if the prayer is already marked as completed.
            if (db.isPrayerCompleted(dateKey, name)) {
                continue;
            }

            int64_t startTime = 0;
            int64_t endTime = 0;

            // Map the centralized name to the correct timestamp in the prayer map.
            if (name == "Fajr") {
                startTime = prayerMap.fajr;
                endTime = prayerMap.fajrEnd;
            } else if (name == "Dhuhr") {
                startTime = prayerMap.dhuhr;
                endTime = prayerMap.dhuhrEnd;
            } else if (name == "Asr") {
                startTime = prayerMap.asr;
                endTime = prayerMap.asrEnd;
            } else if (name == "Maghrib") {
                startTime = prayerMap.maghrib;
                endTime = prayerMap.maghribEnd;
            } else if (name == "Isha") {
                startTime = prayerMap.isha;
                endTime = prayerMap.ishaEnd;
            }

            // Start notification
            if (startTime > nowUnixTimestampSec) {
                NotificationIntent startNotif;
                startNotif.id = dateKey + "_" + name + "_start";
                startNotif.title = "It's time for " + name;
                startNotif.body = "";
                startNotif.triggerTimestampSec = startTime;
                schedule.push_back(startNotif);
            }

            // End notification
            if (endTime > 0) {
                int64_t endWarnTime = endTime - (static_cast<int64_t>(offsetMinutes) * 60LL);
                if (endWarnTime > nowUnixTimestampSec) {
                    NotificationIntent endNotif;
                    endNotif.id = dateKey + "_" + name + "_end";
                    endNotif.title = name + " time is ending in " + std::to_string(offsetMinutes) + " minutes";
                    endNotif.body = "";
                    endNotif.triggerTimestampSec = endWarnTime;
                    schedule.push_back(endNotif);
                }
            }
        }
    }

    std::sort(schedule.begin(), schedule.end(), [](const NotificationIntent& a, const NotificationIntent& b) {
        return a.triggerTimestampSec < b.triggerTimestampSec;
    });

    return schedule;
}

} // namespace waqt
