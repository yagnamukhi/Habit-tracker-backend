export const calculateCurrentStreak = (completedDates) => {
    if(!completedDates || completedDates.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for date-only comparison

    // Normalize completedDates to midnight and sort in descending order
    const normalizedDates = completedDates.map(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }).sort((a, b) => b - a);
    // Strict check if today is in completedDates
    const todayExists = normalizedDates.some(date => date.getTime() === today.getTime());
    if(!todayExists) return 0; // If today is not completed, streak is 0

    let streak = 0;
    let currentDate = new Date(today);
    for(let date of normalizedDates) {
        if(date.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1); // Move to previous day
        }else {
            break; // Break if there's a gap in the streak
        }
    }
    return streak;
}


// Calculate longest streak
export const calculateLongestStreak = (completedDates) => {
    if(!completedDates || completedDates.length === 0) return 0;
    // Normalize completedDates to midnight and sort in ascending order

    const normalizedDates = completedDates.map(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }).sort((a, b) => a - b);

    let longestStreak = 1;
    let currentStreak = 1;

    for(let i = 1; i < normalizedDates.length; i++) {
        let previousDate = normalizedDates[i - 1];
        let currentDate = normalizedDates[i];
        let diffInDays = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
        if(diffInDays === 1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else if(diffInDays > 1) {
            currentStreak = 1; // Reset for new streak  - No longest streak if there's a gap
        }
    }
    return longestStreak;
}