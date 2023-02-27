/**
 * 
 * @param {string} time - time in the format of 'YYYY-MM-DD HH:MM:SS' with time zone
 */
export function formatTime(time) {
    const date = new Date(time);
    return date.toLocaleString();
}
