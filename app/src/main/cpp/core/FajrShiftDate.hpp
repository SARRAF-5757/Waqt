// Utility to handle dates with a custom cutoff for Fajr

#ifndef WAQT_FAJR_SHIFT_DATE_HPP
#define WAQT_FAJR_SHIFT_DATE_HPP

#include <string>
#include <cstdint>

namespace waqt {

class FajrShiftDate {
public:
    static void setFajrCutoff(int minutesFromMidnight);
    static int getFajrCutoff();
    
    // Calculates Fajr cutoff minutes from a UNIX timestamp of Fajr time
    static void setFajrCutoffFromTimestamp(int64_t fajrUnixTimestamp);

    // Returns dateKey (YYYY-MM-DD) shifted by Fajr cutoff
    static std::string getDateKey(int64_t unixTimestampSec);

    // Computes target UNIX timestamp shifted by n days
    static int64_t addDays(int64_t unixTimestampSec, int days);
};

} // namespace waqt

#endif // WAQT_FAJR_SHIFT_DATE_HPP
