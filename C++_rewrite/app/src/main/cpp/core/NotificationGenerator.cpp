#include "NotificationGenerator.hpp"
#include "PrayerCalculator.hpp"
#include "FajrShiftDate.hpp"
#include <algorithm>
#include <ctime>

namespace waqt {

struct PrayerMeta {
    std::string id;
    std::string name;
};

static const std::vector<PrayerMeta> PRAYERS = {
    {"fajr", "Fajr"},
    {"dhuhr", "Dhuhr"},
    {"asr", "Asr"},
    {"maghrib", "Maghrib"},
    {"isha", "Isha"}
};

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
        if (!localTm) continue;

        int year = localTm->tm_year + 1900;
        int month = localTm->tm_mon + 1;
        int day = localTm->tm_mday;

        PrayerTimesMap prayerMap = PrayerCalculator::calculatePrayerTimes(year, month, day, latitude, longitude, method, madhab);
        std::string dateKey = FajrShiftDate::getDateKey(targetTimeSec);

        for (const auto& p : PRAYERS) {
            // Skip scheduling notifications if completed
            if (db.isPrayerCompleted(dateKey, p.id)) {
                continue;
            }

            int64_t startTime = 0;
            int64_t endTime = 0;

            if (p.id == "fajr") {
                startTime = prayerMap.fajr;
                endTime = prayerMap.fajrEnd;
            } else if (p.id == "dhuhr") {
                startTime = prayerMap.dhuhr;
                endTime = prayerMap.dhuhrEnd;
            } else if (p.id == "asr") {
                startTime = prayerMap.asr;
                endTime = prayerMap.asrEnd;
            } else if (p.id == "maghrib") {
                startTime = prayerMap.maghrib;
                endTime = prayerMap.maghribEnd;
            } else if (p.id == "isha") {
                startTime = prayerMap.isha;
                endTime = prayerMap.ishaEnd;
            }

            // Start notification
            if (startTime > nowUnixTimestampSec) {
                NotificationIntent startNotif;
                startNotif.id = dateKey + "_" + p.id + "_start";
                startNotif.title = "It's time for " + p.name;
                startNotif.body = "";
                startNotif.triggerTimestampSec = startTime;
                schedule.push_back(startNotif);
            }

            // End notification
            if (endTime > 0) {
                int64_t endWarnTime = endTime - (static_cast<int64_t>(offsetMinutes) * 60LL);
                if (endWarnTime > nowUnixTimestampSec) {
                    NotificationIntent endNotif;
                    endNotif.id = dateKey + "_" + p.id + "_end";
                    endNotif.title = p.name + " time is ending in " + std::to_string(offsetMinutes) + " minutes";
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
