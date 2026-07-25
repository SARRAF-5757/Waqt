cmake_minimum_required(VERSION 3.22.1)

project("waqt_core")

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/core
    ${CMAKE_CURRENT_SOURCE_DIR}/storage
    ${CMAKE_CURRENT_SOURCE_DIR}/bridge
)

add_library(
    waqt_core
    SHARED
    storage/sqlite3.c
    storage/Database.cpp
    core/AstronomicalMath.cpp
    core/PrayerCalculator.cpp
    core/FajrShiftDate.cpp
    core/NotificationGenerator.cpp
    core/WaqtEngine.cpp
    bridge/jni_bindings.cpp
)

find_library(
    log-lib
    log
)

target_link_libraries(
    waqt_core
    ${log-lib}
)
