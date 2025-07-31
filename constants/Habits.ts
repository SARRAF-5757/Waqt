//# In: constants/Habits.ts

import { format } from 'date-fns';

export const PRAYER_HABITS = [
    { id: 'fajr', name: 'Fajr' },
    { id: 'dhuhr', name: 'Dhuhr' },
    { id: 'asr', name: 'Asr' },
    { id: 'maghrib', name: 'Maghrib' },
    { id: 'isha', name: 'Isha' },
];

// Unified date helpers
export const getDateKey = (d = new Date()) => format(d, 'yyyy-MM-dd');   // storage / context key
export const getHumanDate = (d = new Date()) =>
  format(d, "do LLLL, yyyy");                                            // UI caption

// Old function
export const getTodayDateString = () => {
    return getHumanDate();
};
