import { format } from 'date-fns';

export const PRAYER_HABITS = [
    { id: 'fajr', name: 'Fajr' },
    { id: 'dhuhr', name: 'Dhuhr' },
    { id: 'asr', name: 'Asr' },
    { id: 'maghrib', name: 'Maghrib' },
    { id: 'isha', name: 'Isha' },
];

// storage / context key
export const getDateKey = (d = new Date()) => {
    const date = new Date(d);
    if (date.getHours() < 4) {
        // If before 4am, use the previous day
        date.setDate(date.getDate() - 1);
        //date.setHours(0, 0, 0, 0);  // reset time to midnight
    }
    return format(date, 'yyyy-MM-dd');
};
