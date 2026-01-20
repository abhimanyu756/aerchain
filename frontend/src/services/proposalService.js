import api from './api';

// Proposal Service - handles all proposal-related API calls

/**
 * Get proposal by ID
 * @param {number} id - Proposal ID
 * @returns {Promise} - Proposal object
 */
export const getProposalById = async (id) => {
    const response = await api.get(`/proposals/${id}`);
    return response.data;
};

/**
 * Get all proposals for an RFP
 * @param {number} rfpId - RFP ID
 * @returns {Promise} - Array of proposal objects
 */
export const getProposalsByRFP = async (rfpId) => {
    const response = await api.get(`/rfps/${rfpId}/proposals`);
    return response.data;
};
