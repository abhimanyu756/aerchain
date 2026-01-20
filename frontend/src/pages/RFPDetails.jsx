import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getRFPById } from '../services/rfpService';
import { formatCurrency, formatDate } from '../utils/formatters';

const RFPDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rfp, setRfp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRFP();
    }, [id]);

    const fetchRFP = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getRFPById(id);
            setRfp(data);
        } catch (err) {
            setError(err.error || err.message || 'Failed to fetch RFP');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            sent: 'bg-blue-100 text-blue-800',
            responded: 'bg-green-100 text-green-800',
            closed: 'bg-purple-100 text-purple-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <LoadingSpinner message="Loading RFP details..." />;
    }

    if (error) {
        return (
            <div className="px-6 py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/rfps')}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                >
                    ← Back to RFPs
                </button>
            </div>
        );
    }

    if (!rfp) {
        return null;
    }

    // Parse items if they're a string
    const items = typeof rfp.items === 'string' ? JSON.parse(rfp.items) : rfp.items;

    return (
        <div className="px-6 py-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/rfps')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to RFPs
                </button>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{rfp.title}</h1>
                        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(rfp.status)}`}>
                            {rfp.status}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`/rfps/${id}/proposals`)}
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Proposals
                        </button>
                        <button
                            onClick={() => navigate(`/rfps/${id}/send`)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Send to Vendors
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4">Description</h2>
                        <p className="text-gray-700">{rfp.description}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Items Required</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specifications</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items && items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{item.specifications}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4">Details</h2>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-gray-500">Budget</dt>
                                <dd className="text-lg font-semibold">{formatCurrency(rfp.budget, rfp.currency)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Delivery Deadline</dt>
                                <dd className="text-lg font-semibold">{formatDate(rfp.delivery_deadline)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Payment Terms</dt>
                                <dd className="text-lg font-semibold">{rfp.payment_terms || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Warranty Requirements</dt>
                                <dd className="text-lg font-semibold">{rfp.warranty_requirements || '-'}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Timeline</h2>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-gray-500">Created</dt>
                                <dd className="text-sm font-medium">{formatDate(rfp.created_at)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Last Updated</dt>
                                <dd className="text-sm font-medium">{formatDate(rfp.updated_at)}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            {rfp.additional_requirements && (
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-xl font-bold mb-4">Additional Requirements</h2>
                    <p className="text-gray-700">{rfp.additional_requirements}</p>
                </div>
            )}
        </div>
    );
};

export default RFPDetails;
