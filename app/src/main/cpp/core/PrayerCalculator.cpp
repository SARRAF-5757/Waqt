// Logic for calculating prayer times based on location and date

#include "PrayerCalculator.hpp"
#include "AstronomicalMath.hpp"
#include <cmath>
#include <ctime>

namespace waqt {

// Maps the CalculationMethod variable from string reading
CalculationMethod PrayerCalculator::parseCalculationMethod(const std::string& methodStr) {
    if (methodStr == "MuslimWorldLeague") return CalculationMethod::MuslimWorldLeague;
    if (methodStr == "Egyptian") return CalculationMethod::Egyptian;
    if (methodStr == "Karachi") return CalculationMethod::Karachi;
    if (methodStr == "UmmAlQura") return CalculationMethod::UmmAlQura;
    if (methodStr == "Dubai") return CalculationMethod::Dubai;
    if (methodStr == "NorthAmerica") return CalculationMethod::NorthAmerica;
    if (methodStr == "Kuwait") return CalculationMethod::Kuwait;
    if (methodStr == "Qatar") return CalculationMethod::Qatar;
    if (methodStr == "Singapore") return CalculationMethod::Singapore;
    if (methodStr == "Turkey") return CalculationMethod::Turkey;
    if (methodStr == "Tehran") return CalculationMethod::Tehran;
    return CalculationMethod::MoonsightingCommittee;
}

// Maps string readings to the Madhab variable
Madhab PrayerCalculator::parseMadhab(const std::string& madhabStr) {
    if (madhabStr == "hanafi") return Madhab::Hanafi;
    return Madhab::Shafi;
}

// Convert fractional hours UTC on a given YYYY-MM-DD into a UNIX timestamp
static int64_t hoursUtcToUnixTimestamp(int year, int month, int day, double hoursUtc) {
    // std::tm - a C++ struct for date/time (year is 1900-based, and month is 0-indexed)
    std::tm tmTime{};
    tmTime.tm_year = year - 1900;
    tmTime.tm_mon = month - 1;
    tmTime.tm_mday = day;

    // Normalization: If the calculated time is -1.5 hours or 25 hours (Next morning),
    // shift the day and normalize hours to the 0-24 range
    while (hoursUtc < 0.0) {
        hoursUtc += 24.0;
        tmTime.tm_mday -= 1;
    }
    while (hoursUtc >= 24.0) {
        hoursUtc -= 24.0;
        tmTime.tm_mday += 1;
    }

    // Convert fractional hours into total seconds past midnight
    int totalSeconds = static_cast<int>(std::round(hoursUtc * 3600.0));
    int hour = totalSeconds / 3600;
    int minute = (totalSeconds / 60) % 60;
    int second = totalSeconds % 60;

    tmTime.tm_hour = hour;
    tmTime.tm_min = minute;
    tmTime.tm_sec = second;
    tmTime.tm_isdst = 0; // (UTC)

    // Convert the tm struct into a Unix timestamp
    return static_cast<int64_t>(timegm(&tmTime));
}

/**
 * Calculates start and end times for all five daily prayers based on date and user preferences
 */
PrayerTimesMap PrayerCalculator::calculatePrayerTimes(
    int year, int month, int day,
    const PreferenceSettings& prefs
) {
    PrayerTimesMap map;

    double latitude = prefs.latitude;
    double longitude = prefs.longitude;
    CalculationMethod method = parseCalculationMethod(prefs.calculationMethod);
    Madhab madhab = parseMadhab(prefs.madhab);

    // Determine the sun's required angle below the horizon for Fajr and Isha
    double fajrAngle = 18.0;
    double ishaAngle = 18.0;
    bool ishaInterval = false;
    double ishaMinutesOffset = 0.0;

    switch (method) {
        case CalculationMethod::MuslimWorldLeague:
            fajrAngle = 18.0; ishaAngle = 17.0; break;
        case CalculationMethod::Egyptian:
            fajrAngle = 19.5; ishaAngle = 17.5; break;
        case CalculationMethod::Karachi:
            fajrAngle = 18.0; ishaAngle = 18.0; break;
        case CalculationMethod::UmmAlQura:
            fajrAngle = 18.5; ishaInterval = true; ishaMinutesOffset = 90.0; break;
        case CalculationMethod::Dubai:
            fajrAngle = 18.2; ishaAngle = 18.2; break;
        case CalculationMethod::NorthAmerica:
            fajrAngle = 15.0; ishaAngle = 15.0; break;
        case CalculationMethod::Kuwait:
            fajrAngle = 18.0; ishaAngle = 17.5; break;
        case CalculationMethod::Qatar:
            fajrAngle = 18.0; ishaInterval = true; ishaMinutesOffset = 90.0; break;
        case CalculationMethod::Singapore:
            fajrAngle = 20.0; ishaAngle = 18.0; break;
        case CalculationMethod::Turkey:
            fajrAngle = 18.0; ishaAngle = 17.0; break;
        case CalculationMethod::Tehran:
            fajrAngle = 17.7; ishaAngle = 14.0; break;
        case CalculationMethod::MoonsightingCommittee:
        default:
            fajrAngle = 18.0; ishaAngle = 18.0; break;
    }

    // Calculate the sun's position for the current day
    double julianDay = AstronomicalMath::calculateJulianDay(year, month, day, 12.0);
    double T = AstronomicalMath::calculateJulianCentury(julianDay);

    double declination = AstronomicalMath::calculateSunDeclination(T, latitude);
    double eot = AstronomicalMath::calculateEquationOfTime(T);

    double transit = AstronomicalMath::calculateSolarTransit(longitude, eot);   // midway between sunrise and sunset

    // Use trig to find the Hour Angle, or distance from noon
    int shadowFactor = (madhab == Madhab::Hanafi) ? 2 : 1;

    double sunriseHourAngle = AstronomicalMath::calculateHourAngle(-0.8333, latitude, declination); // refraction + sun disc angle = -0.8333 degrees
    double sunsetHourAngle =  AstronomicalMath::calculateHourAngle(-0.8333, latitude, declination);
    double fajrHourAngle = AstronomicalMath::calculateHourAngle(-fajrAngle, latitude, declination);
    double asrHourAngle = AstronomicalMath::calculateAsrHourAngle(shadowFactor, latitude, declination);
    double ishaHourAngle = AstronomicalMath::calculateHourAngle(-ishaAngle, latitude, declination);

    // Convert the astronomical angles into actual times of day
    double fajrHours = transit - fajrHourAngle;
    double sunriseHours = transit - sunriseHourAngle;
    double dhuhrHours = transit;
    double asrHours = transit + asrHourAngle;
    double maghribHours = transit + sunsetHourAngle;
    double ishaHours = transit + ishaHourAngle;
    if (ishaInterval) {
        ishaHours = maghribHours + (ishaMinutesOffset / 60.0);
    }

    // Calculate Maghrib End
    double maghribEndHours = ishaHours;
    if (prefs.maghribEndMode == "FIXED_MINUTES") {
        maghribEndHours = maghribHours + (prefs.maghribEndCustomMinutes / 60.0);
    } else if (prefs.maghribEndMode == "RED_TWILIGHT" || prefs.maghribEndMode == "WHITE_TWILIGHT") {
        double customHourAngle = AstronomicalMath::calculateHourAngle(-prefs.maghribEndCustomAngle, latitude, declination);
        
        // calculateHourAngle clamps the value, so check if it would have been NaN
        double latRad = AstronomicalMath::degreesToRadians(latitude);
        double decRad = AstronomicalMath::degreesToRadians(declination);
        double angRad = AstronomicalMath::degreesToRadians(-prefs.maghribEndCustomAngle);
        double cosH = (std::sin(angRad) - std::sin(latRad) * std::sin(decRad)) / (std::cos(latRad) * std::cos(decRad));
        
        if (cosH > 1.0 || cosH < -1.0 || std::isnan(customHourAngle)) {
            maghribEndHours = maghribHours + (prefs.maghribEndCustomMinutes / 60.0);
        } else {
            maghribEndHours = transit + customHourAngle;
        }
    } else {
        // TIED_TO_ISHA
        maghribEndHours = ishaHours;
    }

    // Next day's Fajr for Middle of Night calculation
    std::tm tmNext{};
    tmNext.tm_year = year - 1900;
    tmNext.tm_mon = month - 1;
    tmNext.tm_mday = day + 1;
    time_t nextTime = timegm(&tmNext);
    std::tm tmNextParsedStruct;
    std::tm* tmNextParsed = gmtime_r(&nextTime, &tmNextParsedStruct);

    double julianDayNext = AstronomicalMath::calculateJulianDay(tmNextParsed->tm_year + 1900, tmNextParsed->tm_mon + 1, tmNextParsed->tm_mday, 12.0);
    double TNext = AstronomicalMath::calculateJulianCentury(julianDayNext);
    double decNext = AstronomicalMath::calculateSunDeclination(TNext, latitude);
    double eotNext = AstronomicalMath::calculateEquationOfTime(TNext);
    double transitNext = AstronomicalMath::calculateSolarTransit(longitude, eotNext);
    
    double fajrHourAngleNext = AstronomicalMath::calculateHourAngle(-fajrAngle, latitude, decNext);
    double nextFajrHours = transitNext - fajrHourAngleNext;
    
    double sunriseHourAngleNext = AstronomicalMath::calculateHourAngle(-0.8333, latitude, decNext);
    double nextSunriseHours = transitNext - sunriseHourAngleNext;

    // Convert all fractional hours into standard Unix Timestamps
    int64_t maghribTs = hoursUtcToUnixTimestamp(year, month, day, maghribHours);
    int64_t nextFajrTs = hoursUtcToUnixTimestamp(tmNextParsed->tm_year + 1900, tmNextParsed->tm_mon + 1, tmNextParsed->tm_mday, nextFajrHours);
    int64_t nextSunriseTs = hoursUtcToUnixTimestamp(tmNextParsed->tm_year + 1900, tmNextParsed->tm_mon + 1, tmNextParsed->tm_mday, nextSunriseHours);

    int64_t ishaEndTs;
    if (prefs.ishaEndMode == "ASTRONOMICAL_MIDNIGHT") {
        ishaEndTs = maghribTs + (nextSunriseTs - maghribTs) / 2;
    } else if (prefs.ishaEndMode == "FIRST_THIRD") {
        ishaEndTs = maghribTs + (nextFajrTs - maghribTs) / 3;
    } else if (prefs.ishaEndMode == "FAJR_START") {
        ishaEndTs = nextFajrTs;
    } else {
        // ISLAMIC_MIDNIGHT
        ishaEndTs = maghribTs + (nextFajrTs - maghribTs) / 2;
    }

    map.fajr = hoursUtcToUnixTimestamp(year, month, day, fajrHours);
    map.fajrEnd = hoursUtcToUnixTimestamp(year, month, day, sunriseHours);
    map.dhuhr = hoursUtcToUnixTimestamp(year, month, day, dhuhrHours);
    map.dhuhrEnd = hoursUtcToUnixTimestamp(year, month, day, asrHours);
    map.asr = hoursUtcToUnixTimestamp(year, month, day, asrHours);
    map.asrEnd = maghribTs;
    map.maghrib = maghribTs;
    map.maghribEnd = hoursUtcToUnixTimestamp(year, month, day, maghribEndHours);
    map.isha = hoursUtcToUnixTimestamp(year, month, day, ishaHours);
    map.ishaEnd = ishaEndTs;
    map.isValid = true;

    return map;
}

} // namespace waqt
