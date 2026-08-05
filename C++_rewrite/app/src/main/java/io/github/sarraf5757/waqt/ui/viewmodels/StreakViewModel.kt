/**
 * ViewModel managing data for multiple history visualization views and navigation
 */

package io.github.sarraf5757.waqt.ui.viewmodels

import java.time.DayOfWeek
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.TemporalAdjusters

import android.app.Application

import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

import io.github.sarraf5757.waqt.bridge.NativeModels
import io.github.sarraf5757.waqt.bridge.WaqtNativeBridge

enum class MajorView { MATRIX, STATS, BAR_CHART }
enum class Granularity { MAX_DAYS, MONTHLY, WEEKLY, YEARLY }

class StreakViewModel(application: Application) : AndroidViewModel(application) {

    private val _majorView = MutableStateFlow(MajorView.MATRIX)
    val majorView: StateFlow<MajorView> = _majorView.asStateFlow()

    private val _granularity = MutableStateFlow(Granularity.MAX_DAYS)
    val granularity: StateFlow<Granularity> = _granularity.asStateFlow()

    private val _baseDate = MutableStateFlow(LocalDate.now())
    val baseDate: StateFlow<LocalDate> = _baseDate.asStateFlow()

    private val _streakData = MutableStateFlow<NativeModels.StreakGridData?>(null)
    val streakData: StateFlow<NativeModels.StreakGridData?> = _streakData.asStateFlow()

    private val _statsData = MutableStateFlow<NativeModels.HistoryStatsData?>(null)
    val statsData: StateFlow<NativeModels.HistoryStatsData?> = _statsData.asStateFlow()

    private val _dateLabel = MutableStateFlow("")
    val dateLabel: StateFlow<String> = _dateLabel.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        // Automatically refresh when view settings or date changes
        viewModelScope.launch {
            combine(_majorView, _granularity, _baseDate) { mv, gr, date ->
                Triple(mv, gr, date)
            }.collect { (mv, gr, date) ->
                updateDateLabel(mv, gr, date)
                loadData(mv, gr, date)
            }
        }

        // Reactively refresh in background whenever history or preferences change
        viewModelScope.launch {
            merge(WaqtNativeBridge.historyUpdates, WaqtNativeBridge.preferenceUpdates)
                .collect {
                    loadData(_majorView.value, _granularity.value, _baseDate.value)
                }
        }
    }

    private fun updateDateLabel(mv: MajorView, gr: Granularity, date: LocalDate) {
        _dateLabel.value = when (mv) {
            MajorView.MATRIX -> {
                if (gr == Granularity.MONTHLY) date.format(DateTimeFormatter.ofPattern("MMMM yyyy"))
                else ""
            }
            MajorView.STATS, MajorView.BAR_CHART -> {
                when (gr) {
                    Granularity.WEEKLY -> {
                        val start = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY))
                        val end = start.plusDays(6)
                        "${start.format(DateTimeFormatter.ofPattern("MMM d"))} - ${end.format(DateTimeFormatter.ofPattern("MMM d, yyyy"))}"
                    }
                    Granularity.MONTHLY -> date.format(DateTimeFormatter.ofPattern("MMMM yyyy"))
                    Granularity.YEARLY -> date.format(DateTimeFormatter.ofPattern("yyyy"))
                    else -> ""
                }
            }
        }
    }

    private fun loadData(mv: MajorView, gr: Granularity, date: LocalDate) {
        viewModelScope.launch {
            // Only show full-screen loading on first load
            if (_streakData.value == null && _statsData.value == null) {
                _isLoading.value = true
            }

            val range = calculateRange(mv, gr, date)
            val startStr = range.first.format(DateTimeFormatter.ISO_LOCAL_DATE)
            val endStr = range.second.format(DateTimeFormatter.ISO_LOCAL_DATE)

            withContext(Dispatchers.IO) {
                when (mv) {
                    MajorView.MATRIX -> {
                        _streakData.value = WaqtNativeBridge.getRangeGridData(startStr, endStr)
                        _statsData.value = null
                    }
                    MajorView.STATS, MajorView.BAR_CHART -> {
                        _statsData.value = WaqtNativeBridge.getRangeStats(startStr, endStr)
                        _streakData.value = null
                    }
                }
            }
            _isLoading.value = false
        }
    }

    private fun calculateRange(mv: MajorView, gr: Granularity, date: LocalDate): Pair<LocalDate, LocalDate> {
        return when (mv) {
            MajorView.MATRIX -> {
                if (gr == Granularity.MONTHLY) {
                    val start = date.with(TemporalAdjusters.firstDayOfMonth())
                    val end = date.with(TemporalAdjusters.lastDayOfMonth())
                    start to end
                } else {
                    // 105-day block navigation
                    val end = date
                    val start = end.minusDays(104)
                    start to end
                }
            }
            MajorView.STATS, MajorView.BAR_CHART -> {
                when (gr) {
                    Granularity.WEEKLY -> {
                        val start = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY))
                        val end = start.plusDays(6)
                        start to end
                    }
                    Granularity.MONTHLY -> {
                        val start = date.with(TemporalAdjusters.firstDayOfMonth())
                        val end = date.with(TemporalAdjusters.lastDayOfMonth())
                        start to end
                    }
                    Granularity.YEARLY -> {
                        val start = date.with(TemporalAdjusters.firstDayOfYear())
                        val end = date.with(TemporalAdjusters.lastDayOfYear())
                        start to end
                    }
                    else -> date to date
                }
            }
        }
    }

    val canNavigateNext: StateFlow<Boolean> = combine(_granularity, _baseDate) { gr, date ->
        val today = LocalDate.now()
        when (gr) {
            Granularity.MAX_DAYS -> date.isBefore(today)
            Granularity.MONTHLY -> {
                val currentMonth = today.with(TemporalAdjusters.firstDayOfMonth())
                val dateMonth = date.with(TemporalAdjusters.firstDayOfMonth())
                dateMonth.isBefore(currentMonth)
            }
            Granularity.WEEKLY -> {
                val currentWeekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY))
                val dateWeekStart = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY))
                dateWeekStart.isBefore(currentWeekStart)
            }
            Granularity.YEARLY -> date.year < today.year
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    fun setMajorView(mv: MajorView) {
        _majorView.value = mv
        // Sync granularity to valid options for the major view
        when (mv) {
            MajorView.MATRIX -> {
                if (_granularity.value == Granularity.WEEKLY || _granularity.value == Granularity.YEARLY) {
                    _granularity.value = Granularity.MAX_DAYS
                }
            }
            MajorView.STATS, MajorView.BAR_CHART -> {
                if (_granularity.value == Granularity.MAX_DAYS) {
                    _granularity.value = Granularity.WEEKLY
                }
            }
        }
    }

    fun setGranularity(gr: Granularity) {
        _granularity.value = gr
    }

    fun next() {
        if (!canNavigateNext.value) return
        val today = LocalDate.now()
        val nextDate = when (_granularity.value) {
            Granularity.MAX_DAYS -> _baseDate.value.plusDays(105).let { if (it.isAfter(today)) today else it }
            Granularity.MONTHLY -> _baseDate.value.plusMonths(1)
            Granularity.WEEKLY -> _baseDate.value.plusWeeks(1)
            Granularity.YEARLY -> _baseDate.value.plusYears(1)
        }
        _baseDate.value = nextDate
    }

    fun previous() {
        _baseDate.value = when (_granularity.value) {
            Granularity.MAX_DAYS -> _baseDate.value.minusDays(105)
            Granularity.MONTHLY -> _baseDate.value.minusMonths(1)
            Granularity.WEEKLY -> _baseDate.value.minusWeeks(1)
            Granularity.YEARLY -> _baseDate.value.minusYears(1)
        }
    }
}
