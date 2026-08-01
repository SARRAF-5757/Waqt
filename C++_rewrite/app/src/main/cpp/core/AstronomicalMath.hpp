// Astronomical and trigonometric utilities for prayer calculations

#ifndef WAQT_ASTRONOMICAL_MATH_HPP
#define WAQT_ASTRONOMICAL_MATH_HPP

namespace waqt {

/**
 * Astronomical and Trigonometric utilities based on Jean Meeus' Astronomical Algorithms
 */
class AstronomicalMath {
public:
    static double degreesToRadians(double deg);
    static double radiansToDegrees(double rad);
    static double normalizeAngle(double deg);

    static double calculateJulianDay(int year, int month, int day, double hoursUtc = 0.0);
    static double calculateJulianCentury(double julianDay);

    static double calculateSunMeanLongitude(double julianCentury);
    static double calculateSunMeanAnomaly(double julianCentury);
    static double calculateSunEquationOfCenter(double julianCentury, double meanAnomaly);
    static double calculateSunTrueLongitude(double meanLongitude, double equationOfCenter);
    static double calculateSunApparentLongitude(double julianCentury, double trueLongitude);
    static double calculateMeanObliquityOfEcliptic(double julianCentury);
    static double calculateObliquityCorrection(double julianCentury, double meanObliquity);
    static double calculateSunDeclination(double julianCentury, double latitude = 0.0);
    static double calculateEquationOfTime(double julianCentury);

    static double calculateSolarTransit(double longitude, double equationOfTime);
    static double calculateHourAngle(double angle, double latitude, double declination);
    static double calculateAsrHourAngle(int shadowFactor, double latitude, double declination);
};

} // namespace waqt

#endif // WAQT_ASTRONOMICAL_MATH_HPP
