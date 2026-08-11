// Logic for calculating prayer times based on location and date

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

    // Maps the CalculationMethod variable from string reading
    static CalculationMethod parseCalculationMethod(const std::string& methodStr);
    // Maps string readings to the Madhab variable
    static Madhab parseMadhab(const std::string& madhabStr);
};

} // namespace waqt

#endif // WAQT_PRAYER_CALCULATOR_HPP
