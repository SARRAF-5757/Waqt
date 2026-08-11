// Astronomical and trigonometric utilities for prayer calculations

#include "AstronomicalMath.hpp"
#include <cmath>
#include <numbers>
#include <algorithm>

// References- (Astronomical Algorithms by Jean Meeus) https://dn760001.eu.archive.org/0/items/astronomicalalgorithmsjeanmeeus1991/Astronomical%20Algorithms-%20Jean%20Meeus%20(1991).pdf

namespace waqt {
    constexpr double PI = std::numbers::pi;

    double AstronomicalMath::degreesToRadians(double deg) {
        return deg * PI / 180.0;
    }

    double AstronomicalMath::radiansToDegrees(double rad) {
        return rad * 180.0 / PI;
    }

    double AstronomicalMath::normalizeAngle(double deg) {
        double b = deg - 360.0 * std::floor(deg / 360.0);
        if (b < 0.0)
            b += 360.0;
        return b;
    }

    /**
     * JULIAN DAY - Number of days since 4713 BC
     * Source: Jean Meeus' Astronomical Algorithms, Chapter 7
     */
    double AstronomicalMath::calculateJulianDay(int year, int month, int day, double hoursUtc) {
        // Constants used in the Meeus algorithm
        constexpr double DAYS_PER_YEAR = 365.25;
        constexpr double YEAR_SHIFT = 4716.0;
        constexpr double MONTH_FACTOR = 30.6001;
        constexpr double EPOCH_OFFSET = 1524.5;

        constexpr double HOURS_PER_DAY = 24.0;
        constexpr double GREGORIAN_CENTURY_DIVISOR = 100.0;
        constexpr double GREGORIAN_LEAP_CYCLE = 4.0;
        constexpr double GREGORIAN_OFFSET_CONST = 2.0;

        if (month <= 2) {
            year -= 1;
            month += 12;
        }

        double A = std::floor(year / GREGORIAN_CENTURY_DIVISOR);
        double B = GREGORIAN_OFFSET_CONST - A + std::floor(A / GREGORIAN_LEAP_CYCLE);
        double dayFraction = day + (hoursUtc / HOURS_PER_DAY);

        return std::floor(DAYS_PER_YEAR * (year + YEAR_SHIFT))
                + std::floor(MONTH_FACTOR * (month + 1.0)) + dayFraction + B - EPOCH_OFFSET;
    }

    /**
     * JULIAN CENTURY - the time in Julian centuries (36525 days) from the J2000
     * Source: Astronomical Algorithms, Chapter 12
     */
    double AstronomicalMath::calculateJulianCentury(double julianDay) {
        constexpr double J2000_EPOCH_JD = 2451545.0;
        constexpr double DAYS_PER_JULIAN_CENTURY = 36525.0;
        return (julianDay - J2000_EPOCH_JD) / DAYS_PER_JULIAN_CENTURY;
    }

    /**
     * SUN'S MEAN LONGITUDE (L0) - geometric mean longitude of the sun, not corrected for aberration
     * Source: Jean Meeus, Eq 25.2
     */
    double AstronomicalMath::calculateSunMeanLongitude(double T) {
        constexpr double L0_CONST = 280.46646;
        constexpr double L0_T1 = 36000.76983;
        constexpr double L0_T2 = 0.0003032;

        double L0 = L0_CONST + L0_T1 * T + L0_T2 * T * T;
        return normalizeAngle(L0);
    }

    /**
     * SUN'S MEAN ANOMALY (M)
     * Source: Jean Meeus, Eq 25.3
     */
    double AstronomicalMath::calculateSunMeanAnomaly(double T) {
        constexpr double M_CONST = 357.52911;
        constexpr double M_T1 = 35999.05029;
        constexpr double M_T2 = 0.0001537;

        double M = M_CONST + M_T1 * T - M_T2 * T * T;
        return normalizeAngle(M);
    }

    /**
     * SUN'S EQUATION OF CENTER (C) - Corrects the sun's mean position for its elliptical orbit
     * Source: Jean Meeus, Chapter 25
     */
    double AstronomicalMath::calculateSunEquationOfCenter(double T, double M) {
        // Coefficients derived from Earth's orbital eccentricity
        constexpr double C1_T0 = 1.914602;
        constexpr double C1_T1 = 0.004817;
        constexpr double C1_T2 = 0.000014;

        constexpr double C2_T0 = 0.019993;
        constexpr double C2_T1 = 0.000101;

        constexpr double C3_T0 = 0.000289;

        double mRad = degreesToRadians(M);

        return (C1_T0 - C1_T1 * T - C1_T2 * T * T) * std::sin(mRad)
             + (C2_T0 - C2_T1 * T) * std::sin(2.0 * mRad)
             + C3_T0 * std::sin(3.0 * mRad);
    }

    double AstronomicalMath::calculateSunTrueLongitude(double meanLongitude, double equationOfCenter) {
        return meanLongitude + equationOfCenter;
    }

    double AstronomicalMath::calculateSunApparentLongitude(double T, double trueLongitude) {
        constexpr double OMEGA_CONST = 125.04;
        constexpr double OMEGA_T1 = 1934.136;

        constexpr double CORRECTION_CONST = 0.00569;
        constexpr double CORRECTION_SIN_OMEGA = 0.00478;

        double omega = OMEGA_CONST - OMEGA_T1 * T;
        return trueLongitude - CORRECTION_CONST - CORRECTION_SIN_OMEGA * std::sin(degreesToRadians(omega));
    }

    /**
     * MEAN OBLIQUITY OF ECLIPTIC (epsilon0) - Calculates Earth's axial tilt
     * Source: Jean Meeus, Eq 22.2
     */
    double AstronomicalMath::calculateMeanObliquityOfEcliptic(double T) {
        constexpr double BASE_DEG = 23.0;
        constexpr double BASE_MIN = 26.0;
        constexpr double BASE_SEC = 21.448;

        constexpr double T1_COEFF = 46.8150;
        constexpr double T2_COEFF = 0.00059;
        constexpr double T3_COEFF = 0.001813;

        constexpr double SEC_PER_MIN = 60.0;
        constexpr double MIN_PER_DEG = 60.0;

        double seconds = BASE_SEC - T * (T1_COEFF + T * (T2_COEFF - T3_COEFF * T));
        return BASE_DEG + (BASE_MIN + seconds / SEC_PER_MIN) / MIN_PER_DEG;
    }

    double AstronomicalMath::calculateObliquityCorrection(double T, double meanObliquity) {
        constexpr double OMEGA_CONST = 125.04;
        constexpr double OMEGA_T1 = 1934.136;
        constexpr double CORRECTION_COS_OMEGA = 0.00256;

        double omega = OMEGA_CONST - OMEGA_T1 * T;
        return meanObliquity + CORRECTION_COS_OMEGA * std::cos(degreesToRadians(omega));
    }

    double AstronomicalMath::calculateSunDeclination(double T, double /*latitude*/) {
        double L0 = calculateSunMeanLongitude(T);
        double M = calculateSunMeanAnomaly(T);
        double C = calculateSunEquationOfCenter(T, M);
        double TL = calculateSunTrueLongitude(L0, C);
        double AL = calculateSunApparentLongitude(T, TL);
        double MO = calculateMeanObliquityOfEcliptic(T);
        double e = calculateObliquityCorrection(T, MO);

        double sinDec = std::sin(degreesToRadians(e)) * std::sin(degreesToRadians(AL));
        return radiansToDegrees(std::asin(sinDec));
    }

    /**
     * EQUATION OF TIME (E) - difference between solar time and mean time (clock time)
     * Source: Jean Meeus, Chapter 28
     */
    double AstronomicalMath::calculateEquationOfTime(double T) {
        constexpr double ECC_CONST = 0.016708634;
        constexpr double ECC_T1 = 0.000042037;
        constexpr double ECC_T2 = 0.0000001267;

        constexpr double MINUTES_PER_DEGREE = 4.0;

        double L0 = calculateSunMeanLongitude(T);
        double M = calculateSunMeanAnomaly(T);
        double C = calculateSunEquationOfCenter(T, M);
        double TL = calculateSunTrueLongitude(L0, C);
        double AL = calculateSunApparentLongitude(T, TL);
        double MO = calculateMeanObliquityOfEcliptic(T);
        double e = calculateObliquityCorrection(T, MO);

        double eRad = degreesToRadians(e);
        double y = std::tan(eRad / 2.0) * std::tan(eRad / 2.0);

        double l0Rad = degreesToRadians(L0);
        double mRad = degreesToRadians(M);

        double ecc = ECC_CONST - T * (ECC_T1 + ECC_T2 * T);

        double eot = y * std::sin(2.0 * l0Rad)
                   - 2.0 * ecc * std::sin(mRad)
                   + 4.0 * ecc * y * std::sin(mRad) * std::cos(2.0 * l0Rad)
                   - 0.5 * y * y * std::sin(4.0 * l0Rad)
                   - 1.25 * ecc * ecc * std::sin(2.0 * mRad);

        return radiansToDegrees(eot) * MINUTES_PER_DEGREE;
    }

    /**
     * SOLAR TRANSIT (Mid-day) - the time when the sun is at its highest point
     * Source: PrayTimes.org
     */
    double AstronomicalMath::calculateSolarTransit(double longitude, double equationOfTime) {
        constexpr double STANDARD_NOON = 12.0;
        constexpr double DEG_PER_HOUR = 15.0;
        constexpr double MINUTES_PER_HOUR = 60.0;

        return STANDARD_NOON - (longitude / DEG_PER_HOUR) - (equationOfTime / MINUTES_PER_HOUR);
    }

    /**
     * HOUR ANGLE (H) - Finds the time offset from noon for a given solar altitude angle
     * Formula: cos(H) = (sin(angle) - sin(lat) * sin(dec)) / (cos(lat) * cos(dec))
     */
    double AstronomicalMath::calculateHourAngle(double angle, double latitude, double declination) {
        constexpr double DEG_PER_HOUR = 15.0;

        double latRad = degreesToRadians(latitude);
        double decRad = degreesToRadians(declination);
        double angRad = degreesToRadians(angle);

        double cosH = (std::sin(angRad) - std::sin(latRad) * std::sin(decRad)) / (std::cos(latRad) * std::cos(decRad));

        if (cosH > 1.0) cosH = 1.0;
        if (cosH < -1.0) cosH = -1.0;

        double H = radiansToDegrees(std::acos(cosH));
        return H / DEG_PER_HOUR; // Returns hour angle in hours (0 to 12)
    }

    double AstronomicalMath::calculateAsrHourAngle(int shadowFactor, double latitude, double declination) {
        constexpr double SHADOW_DENOMINATOR_BASE = 1.0;

        double deltaLat = std::abs(latitude - declination);
        double deltaLatRad = degreesToRadians(deltaLat);

        double arccot = std::atan(SHADOW_DENOMINATOR_BASE / (shadowFactor + std::tan(deltaLatRad)));
        double angle = radiansToDegrees(arccot);

        return calculateHourAngle(angle, latitude, declination);
    }

} // namespace waqt
