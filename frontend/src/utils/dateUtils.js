/**
 * Utilities for consistent date handling across the application.
 * Prevents UTC timezone shifts for ISO date strings.
 */

/**
 * Parses an ISO date string (YYYY-MM-DD) into a local Date object.
 * Avoiding the day-shift bug caused by new Date("YYYY-MM-DD") being interpreted as UTC.
 * 
 * @param {string} dateStr - Date string in YYYY-MM-DD or similar format
 * @returns {Date|null}
 */
export const parseDateSafe = (dateStr) => {
    if (!dateStr) return null;
    
    // If it's already a date object, return it
    if (dateStr instanceof Date) return dateStr;

    try {
        // Match both YYYY-MM-DD and YYYY/MM/DD
        const parts = dateStr.toString().split(/[-/T\s]/);
        if (parts.length >= 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1; // Month is 0-indexed
            const d = parseInt(parts[2], 10);
            
            // Construct as local date (using local time instead of UTC midnight)
            const date = new Date(y, m, d, 12, 0, 0); // Noon to stay safe from DST shifts
            return isNaN(date.getTime()) ? null : date;
        }
    } catch (e) {
        console.error("Error parsing date safely:", e);
    }
    
    const fallback = new Date(dateStr);
    return isNaN(fallback.getTime()) ? null : fallback;
};

/**
 * Formats a date string safely without timezone shifts.
 * 
 * @param {string} dateStr - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export const formatDateSafe = (dateStr, options = { year: 'numeric', month: 'numeric', day: 'numeric' }) => {
    const date = parseDateSafe(dateStr);
    if (!date) return 'N/A';
    
    return date.toLocaleDateString('es-CO', options);
};
