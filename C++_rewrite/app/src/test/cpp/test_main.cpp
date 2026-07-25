#include <iostream>
#include <cassert>
#include <cmath>
#include "../../main/cpp/core/AstronomicalMath.hpp"
#include "../../main/cpp/core/PrayerCalculator.hpp"
#include "../../main/cpp/core/FajrShiftDate.hpp"
#include "../../main/cpp/core/WaqtEngine.hpp"

using namespace waqt;

void testAstronomicalMath() {
    std::cout << "[Test] Running AstronomicalMath tests..." << std::endl;
    double rad = AstronomicalMath::degreesToRadians(180.0);
    assert(std::abs(rad - 3.141592653589793) < 1e-5);

    double deg = AstronomicalMath::radiansToDegrees(rad);
    assert(std::abs(deg - 180.0) < 1e-5);

    double jd = AstronomicalMath::calculateJulianDay(2025, 10, 25, 12.0);
    assert(jd > 2460000.0);
    std::cout << "  ✓ AstronomicalMath passed." << std::endl;
}

void testPrayerCalculator() {
    std::cout << "[Test] Running PrayerCalculator tests..." << std::endl;
    // Makkah coordinates: 21.4225° N, 39.8262° E
    PrayerTimesMap times = PrayerCalculator::calculatePrayerTimes(
        2025, 10, 25, 21.4225, 39.8262,
        CalculationMethod::UmmAlQura, Madhab::Shafi
    );

    assert(times.isValid);
    assert(times.fajr > 0);
    assert(times.fajrEnd > times.fajr); // Sunrise after Fajr
    assert(times.dhuhr > times.fajrEnd);
    assert(times.asr > times.dhuhr);
    assert(times.maghrib > times.asr);
    assert(times.isha > times.maghrib);
    assert(times.ishaEnd > times.isha); // Middle of night after Isha
    std::cout << "  ✓ PrayerCalculator passed." << std::endl;
}

void testFajrShiftDate() {
    std::cout << "[Test] Running FajrShiftDate tests..." << std::endl;
    // Fajr cutoff set to 5:15 AM (315 minutes)
    FajrShiftDate::setFajrCutoff(315);
    assert(FajrShiftDate::getFajrCutoff() == 315);

    // 4:00 AM on 2025-10-26 should belong to 2025-10-25
    // 2025-10-26 04:00:00 UTC timestamp = 1761451200 (approx)
    std::tm tmTime{};
    tmTime.tm_year = 2025 - 1900;
    tmTime.tm_mon = 10 - 1;
    tmTime.tm_mday = 26;
    tmTime.tm_hour = 4;
    tmTime.tm_min = 0;
    tmTime.tm_sec = 0;
    #if defined(_WIN32)
    time_t ts = _mkgmtime(&tmTime);
    #else
    time_t ts = timegm(&tmTime);
    #endif

    std::string dateKey = FajrShiftDate::getDateKey(ts);
    assert(dateKey == "2025-10-25");
    std::cout << "  ✓ FajrShiftDate passed (Fajr shift correctly applied!)." << std::endl;
}

void testEngineAndDatabase() {
    std::cout << "[Test] Running WaqtEngine & SQLite database tests..." << std::endl;
    auto& engine = WaqtEngine::getInstance();
    bool initOk = engine.initialize(":memory:");
    assert(initOk);

    engine.setLocation(40.7128, -74.0060); // New York
    auto prefs = engine.getPreferences();
    assert(prefs.hasLocation);
    assert(std::abs(prefs.latitude - 40.7128) < 1e-4);

    engine.togglePrayerStatus("2025-10-25", "fajr", true);
    auto status = engine.getTodayStatuses(1761393600); // timestamp for 2025-10-25
    assert(engine.togglePrayerStatus("2025-10-25", "fajr", true) == true);

    auto streak = engine.getStreakData(1761393600);
    assert(streak.totalDays == 105);
    assert(streak.streaks.size() == 5);

    engine.deleteAllHistory();
    auto prefsAfterDelete = engine.getPreferences();
    assert(prefsAfterDelete.hasLocation); // Preferences preserved
    std::cout << "  ✓ WaqtEngine & SQLite database passed." << std::endl;
}

int main() {
    std::cout << "=== Running Waqt Native C++ Core Unit Tests ===" << std::endl;
    testAstronomicalMath();
    testPrayerCalculator();
    testFajrShiftDate();
    testEngineAndDatabase();
    std::cout << "=== All C++ Core Unit Tests Passed Successfully! ===" << std::endl;
    return 0;
}
