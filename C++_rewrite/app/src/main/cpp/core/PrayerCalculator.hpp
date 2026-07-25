#ifndef WAQT_PRAYER_CALCULATOR_HPP
#define WAQT_PRAYER_CALCULATOR_HPP

#include "Models.hpp"

namespace waqt {

class PrayerCalculator {
public:
    static PrayerTimesMap calculatePrayerTimes(
        int year, int month, int day,
        double latitude, double longitude,
        CalculationMethod method = CalculationMethod::MoonsightingCommittee,
        Madhab madhab = Madhab::Shafi
    );

    static CalculationMethod parseCalculationMethod(const std::string& methodStr);
    static Madhab parseMadhab(const std::string& madhabStr);
};

} // namespace waqt

#endif // WAQT_PRAYER_CALCULATOR_HPP
