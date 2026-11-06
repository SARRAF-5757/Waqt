// Unit tests for prayer history backup serialization and validation

package io.github.sarraf5757.waqt

import io.github.sarraf5757.waqt.bridge.NativeModels
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class HistoryBackupTest {

    private val json = Json {
        prettyPrint = true
        ignoreUnknownKeys = true
    }

    /**
     * Verifies that HistoryBackupPayload serializes to JSON and deserializes back faithfully
     */
    @Test
    fun testSerializationRoundTrip() {
        val records = listOf(
            NativeModels.PrayerHistoryRecord(
                dateKey = "2026-11-01",
                prayerId = "Fajr",
                completed = true,
                isOnTime = true
            ),
            NativeModels.PrayerHistoryRecord(
                dateKey = "2026-11-01",
                prayerId = "Dhuhr",
                completed = true,
                isOnTime = false
            ),
            NativeModels.PrayerHistoryRecord(
                dateKey = "2026-11-02",
                prayerId = "Asr",
                completed = false,
                isOnTime = false
            )
        )

        val payload = NativeModels.HistoryBackupPayload(
            version = 1,
            appVersion = "2.1.0",
            exportedAt = 1730574589000L,
            totalRecords = records.size,
            history = records
        )

        val serialized = json.encodeToString(payload)
        assertTrue(serialized.contains("2026-11-01"))
        assertTrue(serialized.contains("Fajr"))

        val deserialized = json.decodeFromString<NativeModels.HistoryBackupPayload>(serialized)
        assertEquals(payload.version, deserialized.version)
        assertEquals(payload.appVersion, deserialized.appVersion)
        assertEquals(payload.totalRecords, deserialized.totalRecords)
        assertEquals(3, deserialized.history.size)

        assertEquals("2026-11-01", deserialized.history[0].dateKey)
        assertEquals("Fajr", deserialized.history[0].prayerId)
        assertTrue(deserialized.history[0].completed)
        assertTrue(deserialized.history[0].isOnTime)

        assertEquals("2026-11-01", deserialized.history[1].dateKey)
        assertEquals("Dhuhr", deserialized.history[1].prayerId)
        assertTrue(deserialized.history[1].completed)
        assertFalse(deserialized.history[1].isOnTime)
    }

    /**
     * Verifies that unknown or future JSON keys are safely ignored during deserialization
     */
    @Test
    fun testIgnoreUnknownKeys() {
        val rawJson = """
            {
                "version": 2,
                "appVersion": "3.0.0",
                "exportedAt": 1730574589000,
                "totalRecords": 1,
                "someFutureField": "future_data",
                "history": [
                    {
                        "dateKey": "2026-11-02",
                        "prayerId": "Maghrib",
                        "completed": true,
                        "isOnTime": true,
                        "extraField": 12345
                    }
                ]
            }
        """.trimIndent()

        val parsed = json.decodeFromString<NativeModels.HistoryBackupPayload>(rawJson)
        assertEquals(2, parsed.version)
        assertEquals(1, parsed.history.size)
        assertEquals("Maghrib", parsed.history[0].prayerId)
    }

    /**
     * Verifies dateKey and prayerId filtering rules
     */
    @Test
    fun testRecordValidationFiltering() {
        val validPrayers = setOf("Fajr", "Dhuhr", "Asr", "Maghrib", "Isha")

        val testRecords = listOf(
            NativeModels.PrayerHistoryRecord("2026-11-01", "Fajr", true, true), // Valid
            NativeModels.PrayerHistoryRecord("invalid-date", "Dhuhr", true, true), // Invalid date
            NativeModels.PrayerHistoryRecord("2026-11-01", "Tahajjud", true, true), // Invalid prayer ID
            NativeModels.PrayerHistoryRecord("2026-13-99", "Isha", true, true), // Malformed date
            NativeModels.PrayerHistoryRecord("2026-11-02", "Isha", true, false) // Valid
        )

        val filtered = testRecords.filter { rec ->
            val isValidDate = try {
                java.time.LocalDate.parse(rec.dateKey)
                true
            } catch (_: Exception) {
                false
            }
            isValidDate && validPrayers.contains(rec.prayerId)
        }

        assertEquals(2, filtered.size)
        assertEquals("Fajr", filtered[0].prayerId)
        assertEquals("Isha", filtered[1].prayerId)
    }
}
