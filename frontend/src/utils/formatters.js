/**
 * Format currency value
 * @param {number} value - Numeric value
 * @param {string} currency - Currency code
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD') => {
    if (!value) return '-';

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(value);
};

/**
 * Format date
 * @param {string} dateString - Date string
 * @returns {string} - Formatted date
 */
export const formatDate = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
};

/**
 * Format date for input field
 * @param {string} dateString - Date string
 * @returns {string} - YYYY-MM-DD format
 */
export const formatDateForInput = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

/**
 * Get status color
 * @param {string} status - Status string
 * @returns {string} - MUI color
 */
export const getStatusColor = (status) => {
    const statusColors = {
        draft: 'default',
        sent: 'primary',
        responded: 'success',
        closed: 'secondary',
        pending: 'warning',
    };

    return statusColors[status] || 'default';
};

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};
