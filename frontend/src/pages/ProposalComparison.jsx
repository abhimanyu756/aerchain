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
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getWinnerVendor = () => {
        if (!comparison?.vendor_scores || comparison.vendor_scores.length === 0) return null;
        return comparison.vendor_scores.reduce((prev, current) =>
            (prev.overall_score > current.overall_score) ? prev : current
        );
    };

    if (loading) {
        return <LoadingSpinner message="Loading proposals..." />;
    }

    const winner = getWinnerVendor();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4">
                <button
                    onClick={() => navigate(`/rfps/${id}`)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-3"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to RFP
                </button>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Vendor Proposals</h1>
                        <p className="text-gray-600">{rfp?.title}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                            {proposals.length} Proposal{proposals.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 max-w-7xl mx-auto">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {proposals.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">Waiting for Proposals</h2>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Vendors haven't responded yet. Proposals will appear here automatically when they reply to your email.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* AI Recommendation Section - Always Visible */}
                        {!comparison ? (
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white text-center">
                                <div className="max-w-2xl mx-auto">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Which vendor should you choose?</h2>
                                    <p className="text-white/80 mb-6">
                                        Let AI analyze all proposals and give you a clear recommendation based on price, delivery, terms, and reliability.
                                    </p>
                                    <button
                                        onClick={handleGetAIComparison}
                                        disabled={loadingComparison || proposals.length < 2}
                                        className="bg-white text-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-lg"
                                    >
                                        {loadingComparison ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
                                                Analyzing Proposals...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Get AI Recommendation
                                            </>
                                        )}
                                    </button>
                                    {proposals.length < 2 && (
                                        <p className="text-white/60 text-sm mt-3">
                                            Need at least 2 proposals to compare
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* AI Recommendation Result */
                            <div className="mb-8">
                                {/* Winner Card */}
                                {winner && (
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 mb-6 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                                                    </svg>
                                                    AI RECOMMENDED
                                                </span>
                                            </div>

                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div>
                                                    <h2 className="text-3xl font-bold mb-1">Go with {winner.vendor_name}</h2>
                                                    <p className="text-white/90 text-lg max-w-2xl">
                                                        {comparison.recommendation?.reasoning}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0 bg-white/20 rounded-2xl p-4 text-center">
                                                    <div className="text-4xl font-bold">{winner.overall_score}</div>
                                                    <div className="text-white/80 text-sm">Score</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Quick Comparison Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {comparison?.vendor_scores?.map((score, index) => {
                                        const isWinner = winner?.vendor_name === score.vendor_name;
                                        const proposal = proposals.find(p => p.vendor_name === score.vendor_name);

                                        return (
                                            <div
                                                key={index}
                                                className={`rounded-xl p-5 ${isWinner
                                                    ? 'bg-green-50 border-2 border-green-500 ring-2 ring-green-200'
                                                    : 'bg-white border border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-bold text-gray-900">{score.vendor_name}</h3>
                                                    {isWinner && (
                                                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                            BEST
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Score Bar */}
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-500">Overall Score</span>
                                                        <span className={`font-bold ${getScoreColor(score.overall_score)}`}>
                                                            {score.overall_score}/100
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${getScoreBg(score.overall_score)}`}
                                                            style={{ width: `${score.overall_score}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Key Metrics */}
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Price</span>
                                                        <span className="font-semibold text-gray-900">
                                                            {formatCurrency(proposal?.total_price)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Delivery</span>
                                                        <span className="font-semibold text-gray-900">
                                                            {proposal?.delivery_time_days ? `${proposal.delivery_time_days} days` : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Warranty</span>
                                                        <span className="font-semibold text-gray-900 truncate max-w-[100px]" title={proposal?.warranty_offered}>
                                                            {proposal?.warranty_offered || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Detailed Scores Table */}
                                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                                    <h3 className="text-lg font-bold mb-4">Detailed Score Breakdown</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="border-b-2 border-gray-200">
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Vendor</th>
                                                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Overall</th>
                                                    <th className="text-center py-3 px-4 font-semibold text-gray-600">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span>💰</span> Price
                                                        </div>
                                                    </th>
                                                    <th className="text-center py-3 px-4 font-semibold text-gray-600">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span>🚚</span> Delivery
                                                        </div>
                                                    </th>
                                                    <th className="text-center py-3 px-4 font-semibold text-gray-600">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span>📋</span> Terms
                                                        </div>
                                                    </th>
                                                    <th className="text-center py-3 px-4 font-semibold text-gray-600">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span>🛡️</span> Warranty
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {comparison?.vendor_scores?.map((score, index) => {
                                                    const isWinner = winner?.vendor_name === score.vendor_name;
                                                    return (
                                                        <tr key={index} className={`border-b ${isWinner ? 'bg-green-50' : ''}`}>
                                                            <td className="py-4 px-4">
                                                                <div className="flex items-center gap-2">
                                                                    {isWinner && (
                                                                        <span className="text-green-500">🏆</span>
                                                                    )}
                                                                    <span className="font-medium text-gray-900">{score.vendor_name}</span>
                                                                </div>
                                                            </td>
                                                            <td className={`text-center py-4 px-4 font-bold text-lg ${getScoreColor(score.overall_score)}`}>
                                                                {score.overall_score}
                                                            </td>
                                                            <td className="text-center py-4 px-4">{score.price_score || 0}</td>
                                                            <td className="text-center py-4 px-4">{score.delivery_score || 0}</td>
                                                            <td className="text-center py-4 px-4">{score.terms_score || 0}</td>
                                                            <td className="text-center py-4 px-4">{score.warranty_score || 0}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Analysis & Concerns */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {comparison?.summary && (
                                        <div className="bg-white rounded-xl shadow-sm p-6">
                                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                                <span className="text-blue-500">📊</span> Analysis Summary
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed">{comparison.summary}</p>
                                        </div>
                                    )}

                                    {comparison?.concerns?.length > 0 && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-amber-800">
                                                <span>⚠️</span> Things to Consider
                                            </h3>
                                            <ul className="space-y-2">
                                                {comparison.concerns.map((concern, index) => (
                                                    <li key={index} className="flex items-start gap-2 text-amber-700">
                                                        <span className="text-amber-500 mt-1">•</span>
                                                        <span>{concern}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Proposal Cards */}
                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">All Proposals</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {proposals.map((proposal) => {
                                    const isWinner = winner?.vendor_name === proposal.vendor_name;
                                    const vendorScore = comparison?.vendor_scores?.find(s => s.vendor_name === proposal.vendor_name);

                                    return (
                                        <div
                                            key={proposal.id}
                                            className={`bg-white rounded-xl shadow-sm p-6 relative ${isWinner ? 'ring-2 ring-green-500' : ''
                                                }`}
                                        >
                                            {isWinner && (
                                                <div className="absolute -top-3 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                                    <span>🏆</span> Recommended
                                                </div>
                                            )}

                                            <div className="flex justify-between items-start mb-4 mt-2">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">{proposal.vendor_name}</h3>
                                                    <p className="text-gray-600">{proposal.company_name}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${proposal.completeness_score >= 80
                                                            ? 'bg-green-100 text-green-800'
                                                            : proposal.completeness_score >= 60
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {proposal.completeness_score}% Complete
                                                    </div>
                                                    {vendorScore && (
                                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(vendorScore.overall_score)} bg-gray-100`}>
                                                            Score: {vendorScore.overall_score}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <span className="text-sm text-gray-500 block">Total Price</span>
                                                    <p className="text-xl font-bold text-green-600">
                                                        {formatCurrency(proposal.total_price, proposal.currency)}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <span className="text-sm text-gray-500 block">Delivery Time</span>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        {proposal.delivery_time_days ? `${proposal.delivery_time_days} days` : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 text-sm">
                                                {proposal.payment_terms && (
                                                    <div>
                                                        <span className="text-gray-500 font-medium">Payment Terms:</span>
                                                        <p className="text-gray-900">{proposal.payment_terms}</p>
                                                    </div>
                                                )}
                                                {proposal.warranty_offered && (
                                                    <div>
                                                        <span className="text-gray-500 font-medium">Warranty:</span>
                                                        <p className="text-gray-900">{proposal.warranty_offered}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                                <span className="text-xs text-gray-400">
                                                    Received: {formatDate(proposal.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProposalComparison;
