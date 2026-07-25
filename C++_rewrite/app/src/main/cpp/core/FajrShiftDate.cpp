#include "FajrShiftDate.hpp"
#include <ctime>
#include <cstdio>

namespace waqt {

static int g_fajrCutoffMinutes = 0;

void FajrShiftDate::setFajrCutoff(int minutesFromMidnight) {
    g_fajrCutoffMinutes = minutesFromMidnight;
}

int FajrShiftDate::getFajrCutoff() {
    return g_fajrCutoffMinutes;
}

void FajrShiftDate::setFajrCutoffFromTimestamp(int64_t fajrUnixTimestamp) {
    if (fajrUnixTimestamp <= 0) {
        g_fajrCutoffMinutes = 0;
        return;
    }
    std::time_t t = static_cast<std::time_t>(fajrUnixTimestamp);
    std::tm* localTm = std::localtime(&t);
    if (localTm) {
        g_fajrCutoffMinutes = localTm->tm_hour * 60 + localTm->tm_min;
    }
}

std::string FajrShiftDate::getDateKey(int64_t unixTimestampSec) {
    std::time_t t = static_cast<std::time_t>(unixTimestampSec);
    // Subtract Fajr cutoff minutes to shift day boundary
    t -= (g_fajrCutoffMinutes * 60);

    std::tm* localTm = std::localtime(&t);
    char buf[32];
    if (localTm) {
        std::strftime(buf, sizeof(buf), "%Y-%m-%d", localTm);
    } else {
        std::snprintf(buf, sizeof(buf), "1970-01-01");
    }
    return std::string(buf);
}

int64_t FajrShiftDate::addDays(int64_t unixTimestampSec, int days) {
    return unixTimestampSec + (static_cast<int64_t>(days) * 86400LL);
}

} // namespace waqt
