import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRFPs } from '../services/rfpService';
import { getAllVendors } from '../services/vendorService';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalRFPs: 0,
        draftRFPs: 0,
        sentRFPs: 0,
        closedRFPs: 0,
        totalVendors: 0,
    });
    const [recentRFPs, setRecentRFPs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rfps, vendors] = await Promise.all([
                getAllRFPs(),
                getAllVendors(),
            ]);
            setStats({
                totalRFPs: rfps.length,
                draftRFPs: rfps.filter((r) => r.status === 'draft').length,
                sentRFPs: rfps.filter((r) => r.status === 'sent').length,
                closedRFPs: rfps.filter((r) => r.status === 'closed').length,
                totalVendors: vendors.length,
            });
            setRecentRFPs(rfps.slice(0, 3));
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, gradient, delay }) => (
        <div
            className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300 ${gradient}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
                <div className="w-full h-full bg-white/10 rounded-full" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                        {icon}
                    </div>
                    <div className="text-5xl font-bold">{loading ? '...' : value}</div>
                </div>
                <div className="text-white/90 font-medium">{title}</div>
            </div>
        </div>
    );

    const QuickActionCard = ({ title, description, icon, onClick, borderColor }) => (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-l-4 ${borderColor}`}
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm">{description}</p>
                </div>
            </div>
        </div>
    );

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-yellow-100 text-yellow-800',
            sent: 'bg-blue-100 text-blue-800',
            closed: 'bg-green-100 text-green-800',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-6 py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                Welcome to <span className="text-blue-200">RFP Manager</span>
                            </h1>
                            <p className="text-blue-100 text-lg">
                                AI-Powered Request for Proposal Management System
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/rfps/create')}
                            className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create New RFP
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        title="Total RFPs"
                        value={stats.totalRFPs}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                        gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                        delay={0}
                    />
                    <StatCard
                        title="Draft RFPs"
                        value={stats.draftRFPs}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        }
                        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                        delay={100}
                    />
                    <StatCard
                        title="Sent to Vendors"
                        value={stats.sentRFPs}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        }
                        gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
                        delay={200}
                    />
                    <StatCard
                        title="Total Vendors"
                        value={stats.totalVendors}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                        gradient="bg-gradient-to-br from-emerald-500 to-green-600"
                        delay={300}
                    />
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    {/* Recent RFPs */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recent RFPs</h2>
                            <button
                                onClick={() => navigate('/rfps')}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                            >
                                View All
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        {recentRFPs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-lg font-medium">No RFPs yet</p>
                                <p className="text-sm">Create your first RFP to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentRFPs.map((rfp) => (
                                    <div
                                        key={rfp.id}
                                        onClick={() => navigate(`/rfps/${rfp.id}`)}
                                        className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{rfp.title}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-1">{rfp.description}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(rfp.status)}`}>
                                                {rfp.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Quick Actions</h2>
                        <QuickActionCard
                            title="Create RFP with AI"
                            description="Use natural language to generate structured RFPs"
                            icon={
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                            }
                            onClick={() => navigate('/rfps/create')}
                            borderColor="border-blue-500"
                        />
                        <QuickActionCard
                            title="View All RFPs"
                            description="Manage and track your procurement requests"
                            icon={
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            }
                            onClick={() => navigate('/rfps')}
                            borderColor="border-purple-500"
                        />
                        <QuickActionCard
                            title="Manage Vendors"
                            description="Add and organize vendor contacts"
                            icon={
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            }
                            onClick={() => navigate('/vendors')}
                            borderColor="border-emerald-500"
                        />
                    </div>
                </div>

                {/* Feature Highlights */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-10 text-white">
                    <h2 className="text-2xl font-bold mb-6 text-center">Powered by AI</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-2">Natural Language Input</h3>
                            <p className="text-gray-400 text-sm">Describe what you need in plain English</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-2">Auto-Email Vendors</h3>
                            <p className="text-gray-400 text-sm">Send RFPs to vendors with one click</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold mb-2">AI Proposal Comparison</h3>
                            <p className="text-gray-400 text-sm">Get smart recommendations on vendors</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
