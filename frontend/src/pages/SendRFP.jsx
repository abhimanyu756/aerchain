import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getRFPById, sendRFPToVendors } from '../services/rfpService';
import { getAllVendors } from '../services/vendorService';

const SendRFP = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rfp, setRfp] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [rfpData, vendorData] = await Promise.all([
                getRFPById(id),
                getAllVendors(),
            ]);
            setRfp(rfpData);
            setVendors(vendorData);
        } catch (err) {
            setError(err.error || err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleVendorToggle = (vendorId) => {
        setSelectedVendors((prev) =>
            prev.includes(vendorId)
                ? prev.filter((id) => id !== vendorId)
                : [...prev, vendorId]
        );
    };

    const handleSelectAll = () => {
        if (selectedVendors.length === vendors.length) {
            setSelectedVendors([]);
        } else {
            setSelectedVendors(vendors.map((v) => v.id));
        }
    };

    const handleSend = async () => {
        if (selectedVendors.length === 0) {
            setError('Please select at least one vendor');
            return;
        }

        setSending(true);
        setError(null);

        try {
            const response = await sendRFPToVendors(id, selectedVendors);
            setResult(response.results);
        } catch (err) {
            setError(err.error || err.message || 'Failed to send RFP');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading..." />;
    }

    if (result) {
        return (
            <div className="px-6 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-4">RFP Sent Successfully!</h2>

                        {result.success.length > 0 && (
                            <div className="mb-4">
                                <p className="text-green-600 font-semibold mb-2">
                                    ✅ Sent to {result.success.length} vendor(s):
                                </p>
                                <ul className="text-sm text-gray-600">
                                    {result.success.map((s, i) => (
                                        <li key={i}>{s.vendor}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.failed.length > 0 && (
                            <div className="mb-4">
                                <p className="text-red-600 font-semibold mb-2">
                                    ❌ Failed to send to {result.failed.length} vendor(s):
                                </p>
                                <ul className="text-sm text-gray-600">
                                    {result.failed.map((f, i) => (
                                        <li key={i}>{f.vendor}: {f.error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center mt-6">
                            <button
                                onClick={() => navigate(`/rfps/${id}`)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                View RFP
                            </button>
                            <button
                                onClick={() => navigate('/rfps')}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Back to RFPs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 py-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate(`/rfps/${id}`)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to RFP
                </button>

                <h1 className="text-4xl font-bold mb-2">Send RFP to Vendors</h1>
                <p className="text-gray-600">
                    Select vendors to receive this RFP via email
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative">
                    <span className="block sm:inline">{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Select Vendors</h2>
                            <button
                                onClick={handleSelectAll}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                {selectedVendors.length === vendors.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        {vendors.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No vendors found</p>
                                <button
                                    onClick={() => navigate('/vendors/new')}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Add vendors first
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {vendors.map((vendor) => (
                                    <label
                                        key={vendor.id}
                                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${selectedVendors.includes(vendor.id)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedVendors.includes(vendor.id)}
                                            onChange={() => handleVendorToggle(vendor.id)}
                                            className="w-5 h-5 text-blue-600 rounded"
                                        />
                                        <div className="ml-4 flex-grow">
                                            <div className="font-medium">{vendor.name}</div>
                                            <div className="text-sm text-gray-600">{vendor.company_name}</div>
                                            <div className="text-sm text-gray-500">{vendor.email}</div>
                                        </div>
                                        {vendor.specialization && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                {vendor.specialization}
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                        <h3 className="text-lg font-bold mb-4">RFP Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-gray-500">Title:</span>
                                <p className="font-medium">{rfp?.title}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Budget:</span>
                                <p className="font-medium">
                                    {rfp?.budget ? `${rfp.currency} ${Number(rfp.budget).toLocaleString()}` : 'Open'}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Deadline:</span>
                                <p className="font-medium">
                                    {rfp?.delivery_deadline
                                        ? new Date(rfp.delivery_deadline).toLocaleDateString()
                                        : 'TBD'}
                                </p>
                            </div>
                        </div>

                        <div className="border-t mt-4 pt-4">
                            <div className="text-sm text-gray-600 mb-4">
                                <span className="font-semibold text-lg text-gray-900">
                                    {selectedVendors.length}
                                </span>
                                {' '}vendor(s) selected
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={sending || selectedVendors.length === 0}
                                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Send RFP
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SendRFP;
