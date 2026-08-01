// Logic for generating upcoming prayer notifications

#ifndef WAQT_NOTIFICATION_GENERATOR_HPP
#define WAQT_NOTIFICATION_GENERATOR_HPP

#include "Models.hpp"
#include "../storage/Database.hpp"
#include <vector>

namespace waqt {

class NotificationGenerator {
public:
    static std::vector<NotificationIntent> generateSchedule(
        int64_t nowUnixTimestampSec,
        double latitude, double longitude,
        int offsetMinutes,
        CalculationMethod method,
        Madhab madhab,
        Database& db
    );
};

} // namespace waqt

#endif // WAQT_NOTIFICATION_GENERATOR_HPP
