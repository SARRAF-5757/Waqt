#include "AstronomicalMath.hpp"
#include <cmath>
#include <numbers>
#include <algorithm>

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
    if (b < 0.0) b += 360.0;
    return b;
}

double AstronomicalMath::calculateJulianDay(int year, int month, int day, double hoursUtc) {
    if (month <= 2) {
        year -= 1;
        month += 12;
    }
    double A = std::floor(year / 100.0);
    double B = 2.0 - A + std::floor(A / 4.0);
    double dayFraction = day + (hoursUtc / 24.0);

    return std::floor(365.25 * (year + 4716.0)) + std::floor(30.6001 * (month + 1.0)) + dayFraction + B - 1524.5;
}

double AstronomicalMath::calculateJulianCentury(double julianDay) {
    return (julianDay - 2451545.0) / 36525.0;
}

double AstronomicalMath::calculateSunMeanLongitude(double T) {
    double L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    return normalizeAngle(L0);
}

double AstronomicalMath::calculateSunMeanAnomaly(double T) {
    double M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    return normalizeAngle(M);
}

double AstronomicalMath::calculateSunEquationOfCenter(double T, double M) {
    double mRad = degreesToRadians(M);
    return (1.914602 - 0.004817 * T - 0.000014 * T * T) * std::sin(mRad)
         + (0.019993 - 0.000101 * T) * std::sin(2.0 * mRad)
         + 0.000289 * std::sin(3.0 * mRad);
}

double AstronomicalMath::calculateSunTrueLongitude(double meanLongitude, double equationOfCenter) {
    return meanLongitude + equationOfCenter;
}

double AstronomicalMath::calculateSunApparentLongitude(double T, double trueLongitude) {
    double omega = 125.04 - 1934.136 * T;
    return trueLongitude - 0.00569 - 0.00478 * std::sin(degreesToRadians(omega));
}

double AstronomicalMath::calculateMeanObliquityOfEcliptic(double T) {
    double seconds = 21.448 - T * (46.8150 + T * (0.00059 - T * 0.001813));
    return 23.0 + (26.0 + seconds / 60.0) / 60.0;
}

double AstronomicalMath::calculateObliquityCorrection(double T, double meanObliquity) {
    double omega = 125.04 - 1934.136 * T;
    return meanObliquity + 0.00256 * std::cos(degreesToRadians(omega));
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

double AstronomicalMath::calculateEquationOfTime(double T) {
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

    double ecc = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);

    double eot = y * std::sin(2.0 * l0Rad)
               - 2.0 * ecc * std::sin(mRad)
               + 4.0 * ecc * y * std::sin(mRad) * std::cos(2.0 * l0Rad)
               - 0.5 * y * y * std::sin(4.0 * l0Rad)
               - 1.25 * ecc * ecc * std::sin(2.0 * mRad);

    return radiansToDegrees(eot) * 4.0; // Minutes of time
}

double AstronomicalMath::calculateSolarTransit(double longitude, double equationOfTime) {
    return 12.0 - (longitude / 15.0) - (equationOfTime / 60.0);
}

double AstronomicalMath::calculateHourAngle(double angle, double latitude, double declination) {
    double latRad = degreesToRadians(latitude);
    double decRad = degreesToRadians(declination);
    double angRad = degreesToRadians(angle);

    double cosH = (std::sin(angRad) - std::sin(latRad) * std::sin(decRad)) / (std::cos(latRad) * std::cos(decRad));

    if (cosH > 1.0) cosH = 1.0;
    if (cosH < -1.0) cosH = -1.0;

    double H = radiansToDegrees(std::acos(cosH));
    return H / 15.0; // Returns hour angle in hours (0 to 12)
}

double AstronomicalMath::calculateAsrHourAngle(int shadowFactor, double latitude, double declination) {
    double latRad = degreesToRadians(latitude);

    double deltaLat = std::abs(latitude - declination);
    double deltaLatRad = degreesToRadians(deltaLat);

    double arccot = std::atan(1.0 / (shadowFactor + std::tan(deltaLatRad)));
    double angle = radiansToDegrees(arccot);

    return calculateHourAngle(angle, latitude, declination);
}

} // namespace waqt
