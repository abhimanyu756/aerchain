import api from './api';

// Vendor Service - handles all vendor-related API calls

/**
 * Get all vendors
 * @returns {Promise} - Array of vendor objects
 */
export const getAllVendors = async () => {
    const response = await api.get('/vendors');
    return response.data;
};

/**
 * Get vendor by ID
 * @param {number} id - Vendor ID
 * @returns {Promise} - Vendor object
 */
export const getVendorById = async (id) => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
};

/**
 * Create new vendor
 * @param {object} vendorData - Vendor data object
 * @returns {Promise} - Created vendor object
 */
export const createVendor = async (vendorData) => {
    const response = await api.post('/vendors', vendorData);
    return response.data;
};

/**
 * Update vendor
 * @param {number} id - Vendor ID
 * @param {object} vendorData - Updated vendor data
 * @returns {Promise} - Updated vendor object
 */
export const updateVendor = async (id, vendorData) => {
    const response = await api.put(`/vendors/${id}`, vendorData);
    return response.data;
};

/**
 * Delete vendor
 * @param {number} id - Vendor ID
 * @returns {Promise}
 */
export const deleteVendor = async (id) => {
    const response = await api.delete(`/vendors/${id}`);
    return response.data;
};
