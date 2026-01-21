import api from './api';

// RFP Service - handles all RFP-related API calls

/**
 * Create RFP from natural language input
 * @param {string} naturalLanguageInput - User's natural language description
 * @returns {Promise} - Created RFP object
 */
export const createRFPFromText = async (naturalLanguageInput) => {
    const response = await api.post('/rfps/create-from-text', { naturalLanguageInput });
    return response.data;
};

/**
 * Create or update RFP
 * @param {object} rfpData - RFP data object
 * @returns {Promise} - Created/Updated RFP object
 */
export const saveRFP = async (rfpData) => {
    if (rfpData.id) {
        const response = await api.put(`/rfps/${rfpData.id}`, rfpData);
        return response.data;
    } else {
        const response = await api.post('/rfps', rfpData);
        return response.data;
    }
};

/**
 * Get all RFPs
 * @returns {Promise} - Array of RFP objects
 */
export const getAllRFPs = async () => {
    const response = await api.get('/rfps');
    return response.data;
};

/**
 * Get RFP by ID
 * @param {number} id - RFP ID
 * @returns {Promise} - RFP object
 */
export const getRFPById = async (id) => {
    const response = await api.get(`/rfps/${id}`);
    return response.data;
};

/**
 * Delete RFP
 * @param {number} id - RFP ID
 * @returns {Promise}
 */
export const deleteRFP = async (id) => {
    const response = await api.delete(`/rfps/${id}`);
    return response.data;
};

/**
 * Send RFP to vendors
 * @param {number} rfpId - RFP ID
 * @param {array} vendorIds - Array of vendor IDs
 * @returns {Promise} - Send result
 */
export const sendRFPToVendors = async (rfpId, vendorIds) => {
    const response = await api.post(`/rfps/${rfpId}/send`, { vendorIds });
    return response.data;
};

/**
 * Get proposals for an RFP
 * @param {number} rfpId - RFP ID
 * @returns {Promise} - Array of proposal objects
 */
export const getRFPProposals = async (rfpId) => {
    const response = await api.get(`/rfps/${rfpId}/proposals`);
    return response.data;
};

/**
 * Get AI-powered comparison for an RFP
 * @param {number} rfpId - RFP ID
 * @returns {Promise} - Comparison data with AI analysis
 */
export const getRFPComparison = async (rfpId) => {
    const response = await api.get(`/rfps/${rfpId}/comparison`);
    return response.data;
};

/**
 * Get RFP with vendor send status
 * @param {number} rfpId - RFP ID
 * @returns {Promise} - RFP with vendors and their send status
 */
export const getRFPWithVendors = async (rfpId) => {
    const response = await api.get(`/rfps/${rfpId}/vendors`);
    return response.data;
};
