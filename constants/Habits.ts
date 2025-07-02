//# In: constants/Habits.ts

export const PRAYER_HABITS = [
    { id: 'fajr', name: 'Fajr' },
    { id: 'dhuhr', name: 'Dhuhr' },
    { id: 'asr', name: 'Asr' },
    { id: 'maghrib', name: 'Maghrib' },
    { id: 'isha', name: 'Isha' },
];

export const getTodayDateString = () => {
    const today = new Date();
    const day = today.getDate();
    const year = today.getFullYear();
    const month = today.toLocaleString('default', { month: 'long' });
    // Get ordinal suffix
    const getOrdinal = (n: number) => {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };
    return `${day}${getOrdinal(day)} ${month}, ${year}`;
};