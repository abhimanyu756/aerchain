import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getRFPById, getRFPProposals, getRFPComparison } from '../services/rfpService';
import { formatCurrency, formatDate } from '../utils/formatters';

const ProposalComparison = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rfp, setRfp] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingComparison, setLoadingComparison] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('proposals');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [rfpData, proposalsData] = await Promise.all([
                getRFPById(id),
                getRFPProposals(id),
            ]);
            setRfp(rfpData);
            setProposals(proposalsData);
        } catch (err) {
            setError(err.error || err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleGetAIComparison = async () => {
        setLoadingComparison(true);
        try {
            const result = await getRFPComparison(id);
            setComparison(result.comparison);
            setActiveTab('comparison');
        } catch (err) {
            setError(err.error || err.message || 'Failed to get AI comparison');
        } finally {
            setLoadingComparison(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-100';
        if (score >= 60) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    if (loading) {
        return <LoadingSpinner message="Loading proposals..." />;
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

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Vendor Proposals</h1>
                        <p className="text-gray-600">{rfp?.title}</p>
                    </div>
                    {proposals.length >= 2 && (
                        <button
                            onClick={handleGetAIComparison}
                            disabled={loadingComparison}
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
                        >
                            {loadingComparison ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    Get AI Recommendation
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="border-b mb-6">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('proposals')}
                        className={`py-3 px-4 font-medium border-b-2 transition-colors ${activeTab === 'proposals'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Proposals ({proposals.length})
                    </button>
                    {comparison && (
                        <button
                            onClick={() => setActiveTab('comparison')}
                            className={`py-3 px-4 font-medium border-b-2 transition-colors ${activeTab === 'comparison'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            AI Comparison
                        </button>
                    )}
                </nav>
            </div>

            {proposals.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-600 mb-2">No proposals yet</h2>
                    <p className="text-gray-500 mb-4">
                        Waiting for vendors to respond to your RFP
                    </p>
                    <p className="text-sm text-gray-400">
                        Proposals will appear here when vendors reply to your email
                    </p>
                </div>
            ) : activeTab === 'proposals' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {proposals.map((proposal) => (
                        <div key={proposal.id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">{proposal.vendor_name}</h3>
                                    <p className="text-gray-600">{proposal.company_name}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBg(proposal.completeness_score)} ${getScoreColor(proposal.completeness_score)}`}>
                                    {proposal.completeness_score}% Complete
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="text-sm text-gray-500">Total Price</span>
                                    <p className="text-lg font-bold text-green-600">
                                        {formatCurrency(proposal.total_price, proposal.currency)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Delivery Time</span>
                                    <p className="text-lg font-semibold">
                                        {proposal.delivery_time_days ? `${proposal.delivery_time_days} days` : '-'}
                                    </p>
                                </div>
                            </div>

                            {proposal.payment_terms && (
                                <div className="mb-3">
                                    <span className="text-sm text-gray-500">Payment Terms</span>
                                    <p className="text-sm">{proposal.payment_terms}</p>
                                </div>
                            )}

                            {proposal.warranty_offered && (
                                <div className="mb-3">
                                    <span className="text-sm text-gray-500">Warranty</span>
                                    <p className="text-sm">{proposal.warranty_offered}</p>
                                </div>
                            )}

                            <div className="flex gap-2 mt-4 pt-4 border-t">
                                <span className={`px-2 py-1 text-xs rounded-full ${proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                        proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {proposal.status}
                                </span>
                                <span className="text-xs text-gray-400">
                                    Received: {formatDate(proposal.created_at)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* AI Comparison View */
                <div className="space-y-6">
                    {/* Recommendation Banner */}
                    {comparison?.recommendation && (
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">AI Recommendation</h3>
                                    <p className="opacity-90">{comparison.recommendation.reasoning}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary */}
                    {comparison?.summary && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold mb-3">Analysis Summary</h3>
                            <p className="text-gray-700">{comparison.summary}</p>
                        </div>
                    )}

                    {/* Vendor Scores */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold mb-4">Vendor Scores</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-3">Vendor</th>
                                        <th className="text-center py-2 px-3">Overall</th>
                                        <th className="text-center py-2 px-3">Price</th>
                                        <th className="text-center py-2 px-3">Delivery</th>
                                        <th className="text-center py-2 px-3">Terms</th>
                                        <th className="text-center py-2 px-3">Warranty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparison?.vendor_scores?.map((score, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-3 px-3 font-medium">{score.vendor_name}</td>
                                            <td className={`text-center py-3 px-3 font-bold ${getScoreColor(score.overall_score)}`}>
                                                {score.overall_score}
                                            </td>
                                            <td className="text-center py-3 px-3">{score.price_score}</td>
                                            <td className="text-center py-3 px-3">{score.delivery_score}</td>
                                            <td className="text-center py-3 px-3">{score.terms_score}</td>
                                            <td className="text-center py-3 px-3">{score.warranty_score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Concerns */}
                    {comparison?.concerns?.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <h3 className="text-lg font-bold text-yellow-800 mb-3">⚠️ Concerns</h3>
                            <ul className="list-disc pl-5 text-yellow-700">
                                {comparison.concerns.map((concern, index) => (
                                    <li key={index}>{concern}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProposalComparison;
